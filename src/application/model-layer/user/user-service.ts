import { WebsocketHandler } from 'reactive-websocket';

import { AuthenticationType } from '../core/models/authentication/authentication-types';
import { AuthenticatorProvider } from '../../interfaces/authenticator-provider';
import { AuthenticatorProviderService } from './../../services/authenticator-provider-service';
import { DatabaseAdapter } from '../../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../../adapter/interfaces/database-port';
import { Constructable, Inject } from '../core/modules/decorators';
import { Logger } from '../../../application/services/logger';
import { User } from '../core/models/user';
import { UserHandler } from './user-handler';

interface UserDto {
  readonly username: string;
  readonly userId: string;
  /**
   * An email-address of a user.
   */
  readonly email?: string;
  /**
   * Property to determine, with which types a user wants to authenticate.
   */
  authenticationTypes: AuthenticationType[];
}

@Constructable(UserHandler)
export class UserService extends UserHandler {
  @Inject(DatabaseAdapter)
  private readonly database: DatabasePort;

  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  @Inject(AuthenticatorProviderService)
  private readonly authenticator: AuthenticatorProvider;

  private userDatabase: ReplicaObject;

  private userCounter: number;

  public constructor() {
    super();
    this.init();
  }

  private async init(): Promise<void> {
    this.userDatabase = await this.database.getReplicaObject(User.COLLECTIONSTRING, User as any, [
      'username',
      'userId'
    ]);
    this.userCounter = await this.getFirstIdCounter();
    this.initWebsocketEvents();
  }

  public async create(partialUser: Partial<User>): Promise<User> {
    try {
      Logger.debug('Trying to insert new user...');
      const user = await this.getUserByUsername(partialUser.username as string);
      Logger.debug(`User ${user.username} is already existing.`);
      return user;
    } catch (e) {
      Logger.debug(`User ${partialUser.username} is not existing...`);
      const user = await this.insertNewUser(partialUser);
      Logger.debug('Insert new user:', user);
      return user;
    }
  }

  public async update(userId: string, update: Partial<User>): Promise<void> {
    const user = await this.getUserByUserId(userId);
    const updatedUser = { ...user, ...update };
    Logger.log(
      `Aktualisiere Benutzer ${update.username} mit folgenden Faktoren ${update.authenticationTypes?.join(', ')}`
    );
    await this.userDatabase.set(userId, updatedUser);
  }

  public async delete(userId: string): Promise<void> {
    await this.userDatabase.remove(userId);
  }

  public async getUserByUsername(username: string): Promise<User> {
    const users = await this.userDatabase.find<User>('username', username);
    if (users.length > 1) {
      throw new Error('Find multiple users');
    }
    if (!users.length) {
      throw new Error('User not found');
    }
    return users[0];
  }

  public async getUserByUserId(userId: string): Promise<User> {
    Logger.debug(`Try to get user with userId: ${userId}`);
    const users = await this.userDatabase.get<User>(userId);
    if (!users) {
      throw new Error(`User with userId ${userId} not found`);
    }
    return users;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userDatabase.getAll<User>();
    return users.map(user => new User(user));
  }

  private async insertNewUser(partialUser: Partial<User>): Promise<User> {
    const userId = (++this.userCounter).toString();
    const user: User = new User({
      ...partialUser,
      userId,
      authenticationTypes: partialUser.authenticationTypes
    });
    Logger.log(
      `Speicher Benutzer ${partialUser.username} unter ID ${userId}.`,
      `Folgende Faktoren: ${partialUser.authenticationTypes?.join(', ')}`
    );
    await this.userDatabase.set(`${userId}`, user);
    return user;
  }

  private async getAllUsersForClient(): Promise<UserDto[]> {
    const users = await this.getAllUsers();
    return users.map(user => ({
      authenticationTypes: user.authenticationTypes,
      username: user.username,
      userId: user.userId
    }));
  }

  private async sendAllUsers(toSocket?: string): Promise<void> {
    const users = await this.getAllUsersForClient();
    if (toSocket) {
      this.websocket.emit(toSocket, { event: 'all-users', data: [...users] });
    } else {
      this.websocket.broadcastAll({ event: 'all-users', data: [...users] });
    }
  }

  public async hasUser(username: string): Promise<boolean> {
    const users = await this.userDatabase.find<User>('username', username);
    return users.length === 1;
  }

  public async reset(): Promise<void> {
    const user = new User({
      userId: '1',
      username: 'admin',
      password: 'admin',
      authenticationTypes: [AuthenticationType.PASSWORD]
    });
    await this.update(user.userId, user);
  }

  private async resetDatabase(): Promise<void> {
    await this.userDatabase.clear();
    await this.mockUserData();
  }

  private initWebsocketEvents(): void {
    this.websocket.fromEvent<any>('all-users').subscribe(message => {
      this.sendAllUsers(message.socketId);
    });
    this.websocket
      .fromEvent<any>('create-user')
      .subscribe(async message => await this.onCreateEvent(message.data, message.socketId));
    this.websocket
      .fromEvent<any>('get-user')
      .subscribe(async message => await this.onGetEvent(message.data, message.socketId));
    this.websocket
      .fromEvent<any>('update-user')
      .subscribe(async message => await this.onUpdateEvent(message.data, message.socketId));
    this.websocket
      .fromEvent<any>('delete-user')
      .subscribe(async message => await this.onDeleteEvent(message.data, message.socketId));
    this.websocket
      .fromEvent<any>('reset-database')
      .subscribe(async message => await this.onResetEvent(message.socketId));
  }

  private async onCreateEvent(partialUser: User, socketId: string): Promise<void> {
    try {
      await this.create(await this.authenticator.writeAuthenticationValues(partialUser));
    } catch (e) {
      Logger.debug('An error occurred:', e);
    }
    this.sendAllUsers(socketId);
  }

  private async onGetEvent(userId: string, socketId: string): Promise<void> {
    const user = await this.getUserByUserId(userId);
    this.websocket.emit(socketId, { event: 'get-user', data: user });
  }

  private async onUpdateEvent(update: User, socketId: string): Promise<void> {
    try {
      await this.update(update.userId, await this.authenticator.writeAuthenticationValues(update));
    } catch (e) {
      Logger.debug('An error occurred:', e);
    }
    this.sendAllUsers(socketId);
  }

  private async onDeleteEvent(userId: string, socketId: string): Promise<void> {
    await this.delete(userId);
    this.sendAllUsers(socketId);
  }

  private async onResetEvent(socketId: string): Promise<void> {
    await this.resetDatabase();
    this.sendAllUsers(socketId);
  }

  private async mockUserData(): Promise<void> {
    const user = (await this.userDatabase.find<User>('username', 'admin'))[0];
    if (!user) {
      await this.create({
        username: 'admin',
        password: 'admin',
        authenticationTypes: [AuthenticationType.PASSWORD]
      });
    }
  }

  private async getFirstIdCounter(): Promise<number> {
    const allUsersDto = (await this.getAllUsersForClient()).map(dto => parseInt(dto.userId, 10));
    return Math.max(...allUsersDto);
  }
}

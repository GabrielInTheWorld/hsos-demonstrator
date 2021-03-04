import { WebsocketHandler } from 'reactive-websocket';

import { AuthenticationType } from './authentication-types';
import { DatabaseAdapter } from '../../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../../adapter/interfaces/database-port';
import { Constructable, Inject } from '../core/modules/decorators';
import { Logger } from '../../../application/services/logger';
import { User } from '../core/models/user';
import { UserHandler } from './user-handler';
import { AuthenticatorProviderService } from './../../services/authenticator-provider-service';
import { AuthenticatorProvider } from '../../interfaces/authenticator-provider';

interface UserDto {
  // readonly databaseKey?: string;
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

  private userCounter = 0;

  public get defaultAuthenticationMethod(): AuthenticationType[] {
    return this._defaultAuthenticationMethods;
  }

  private _defaultAuthenticationMethods = [AuthenticationType.PASSWORD];

  public constructor() {
    super();
    this.init();
  }

  private async init(): Promise<void> {
    this.userDatabase = await this.database.getReplicaObject(User.COLLECTIONSTRING, User as any, [
      'username',
      'userId'
    ]);
    const keys = await this.userDatabase.keys();
    this.userCounter = keys.length;
    this.initWebsocketEvents();
  }

  public async create(partialUser: Partial<User>): Promise<User> {
    const userId = (++this.userCounter).toString();
    const user: User = new User({
      ...partialUser,
      userId,
      authenticationTypes: partialUser.authenticationTypes || [...this.defaultAuthenticationMethod]
    });
    await this.userDatabase.set(`${userId}`, user);
    return user;
  }

  public async update(userId: string, update: Partial<User>): Promise<void> {
    const user = await this.getUserByUserId(userId);
    const updatedUser = { ...user, ...update };
    await this.userDatabase.set(userId, updatedUser);
  }

  public async delete(userId: string): Promise<void> {
    await this.userDatabase.remove(userId);
  }

  private async updateAll(update: Partial<User>): Promise<void> {
    const users = await this.getAllUsers();
    users.forEach(user => user.update({ ...update }));
    const promises = users.map(user => this.userDatabase.set(user.userId, user));
    await Promise.all(promises);
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
      Logger.debug('User not found');
      throw new Error('User not found');
    }
    return users;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userDatabase.getAll<User>();
    Logger.debug('Users', users);
    return users.map(user => new User(user));
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

  public setDefaultAuthenticationTypes(types: AuthenticationType[]): Promise<void> {
    this._defaultAuthenticationMethods = types;
    return this.updateAll({ authenticationTypes: types });
  }

  public async reset(): Promise<void> {
    const user = new User({
      userId: '1',
      username: 'admin',
      password: 'admin',
      authenticationTypes: [AuthenticationType.PASSWORD]
    });
    Logger.debug('Default methods:', this.defaultAuthenticationMethod, this._defaultAuthenticationMethods);
    Logger.debug('Reset to user:', user);
    await this.update(user.userId, user);
  }

  private async resetDatabase(): Promise<void> {
    await this.userDatabase.clear();
    await this.mockUserData();
  }

  private initWebsocketEvents(): void {
    this.websocket.fromEvent('all-users').subscribe(() => {
      this.sendAllUsers();
    });
    this.websocket.fromEvent<any>('create-user').subscribe(async message => {
      console.log('Received event: create-user: ', message);
      const partialUser = message.data;
      await this.create(await this.authenticator.writeAuthenticationValues(partialUser));
      this.sendAllUsers(message.socketId);
    });
    this.websocket.fromEvent<any>('get-user').subscribe(async message => {
      const id = message.data;
      console.log('Received event: get-user', id);
      this.websocket.broadcastAll({ event: 'get-user', data: await this.getUserByUserId(id) });
    });
    this.websocket.fromEvent<any>('update-user').subscribe(async message => {
      const update = message.data;
      await this.update(update.userId, update);
      this.sendAllUsers(message.socketId);
    });
    this.websocket.fromEvent<any>('delete-user').subscribe(async message => {
      const id = message.data;
      await this.delete(id);
      this.sendAllUsers(message.socketId);
    });
    this.websocket.fromEvent<any>('reset-database').subscribe(async message => {
      await this.resetDatabase();
      this.sendAllUsers(message.socketId);
    });
  }

  private async mockUserData(): Promise<void> {
    const user = (await this.userDatabase.find<User>('username', 'admin'))[0];
    Logger.debug('mockUserData', user);
    if (!user) {
      await this.create({
        username: 'admin',
        password: 'admin',
        authenticationTypes: [...this.defaultAuthenticationMethod]
      });
    }
  }
}

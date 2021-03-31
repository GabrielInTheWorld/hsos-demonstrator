import { AuthGuard } from 'auth-guard';
import { IUser } from 'auth-guard/dist/lib/core/models/user';
import { Inject } from 'final-di';

import { AuthenticationType } from '../core/models/authentication/authentication-types';
import { DatabaseAdapter } from '../../../adapter/services/database-adapter';
import { DatabasePort, ReplicaObject } from '../../../adapter/interfaces/database-port';
import { Logger } from '../../../application/services/logger';
import { User } from '../core/models/user';
import { UserHandler } from './user-handler';
import { Config } from '../../util/config';

interface UserDto extends IUser {}

export class UserService implements UserHandler {
  @Inject(DatabaseAdapter)
  private readonly database: DatabasePort;

  @Inject(AuthGuard, {
    logger: Logger.getInstance(),
    expectedOrigins: [Config.localClientUrl, Config.localServerUrl],
    domain: 'no-reply@demonstrator.com'
  })
  private readonly authenticator: AuthGuard;

  private userDatabase: ReplicaObject;

  private userCounter: number;

  public constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.userDatabase = await this.database.getReplicaObject(User.COLLECTIONSTRING, User as any, [
      'username',
      'userId'
    ]);
    this.userCounter = await this.getFirstIdCounter();
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

  public async getAllUsersForClient(): Promise<UserDto[]> {
    const users = await this.getAllUsers();
    return users.map(user => ({
      authenticationTypes: user.authenticationTypes,
      username: user.username,
      userId: user.userId
    }));
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
    this.userCounter = 0;
    await this.mockUserData();
  }

  public async onCreateEvent(partialUser: User, values: any): Promise<void> {
    await this.create(this.authenticator.register(partialUser, values));
  }

  public async onGetEvent(userId: string): Promise<User> {
    return await this.getUserByUserId(userId);
  }

  public async onUpdateEvent(update: User, values: any): Promise<void> {
    await this.update(update.userId, this.authenticator.register(update, values));
  }

  public async onDeleteEvent(userId: string): Promise<void> {
    await this.delete(userId);
  }

  public async onResetEvent(): Promise<void> {
    await this.resetDatabase();
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
    const allUsers = await this.getAllUsersForClient();
    if (allUsers.length) {
      const allUsersDto = allUsers.map(dto => parseInt(dto.userId, 10));
      return Math.max(...allUsersDto);
    } else {
      return 0;
    }
  }
}

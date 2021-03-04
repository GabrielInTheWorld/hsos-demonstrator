import { AuthenticationType } from './authentication-types';
import { User } from '../core/models/user';

export abstract class UserHandler {
  public abstract create(user: Partial<User>): Promise<User>;
  public abstract update(userId: string, updatedUser: Partial<User>): Promise<void>;
  public abstract getUserByUsername(username: string): Promise<User>;
  public abstract getUserByUserId(userId: string): Promise<User>;
  public abstract getAllUsers(): Promise<User[]>;
  public abstract hasUser(username: string): Promise<boolean>;
  public abstract setDefaultAuthenticationTypes(types: AuthenticationType[]): Promise<void>;
  public abstract reset(): Promise<void>;
}

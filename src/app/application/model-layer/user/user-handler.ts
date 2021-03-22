import { User } from '../core/models/user';

export interface UserHandler {
  create(user: Partial<User>): Promise<User>;
  update(userId: string, updatedUser: Partial<User>): Promise<void>;
  getUserByUsername(username: string): Promise<User>;
  getUserByUserId(userId: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  hasUser(username: string): Promise<boolean>;
  reset(): Promise<void>;
}

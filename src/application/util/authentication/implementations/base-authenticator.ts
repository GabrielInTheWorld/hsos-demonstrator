import { Authenticator, AuthenticatorValidationResult } from '../interfaces/authenticator';
import { User } from './../../../model-layer/core/models/user';
import { HotpService, TotpService } from 'final-otp';

export abstract class BaseAuthenticator implements Authenticator {
  protected hotpService = HotpService;
  protected totpService = TotpService;

  protected currentlyPendingUsers = new Map<string, User>();
  protected intervals = new Map<string, NodeJS.Timeout>();

  public abstract isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult>;
  public async prepareAuthenticationType(user: User, value?: any): Promise<User> {
    return user;
  }

  /**
   * @deprecated Do not use! Use instead `isAuthenticationTypeMissing`!
   * @param user
   * @param value
   */
  public checkAuthenticationType(user: User, value?: string): void {
    throw new Error('Do not use!');
  }

  /**
   * @deprecated Do not use!
   * @param user
   * @param value
   */
  public writeAuthenticationType(user: User, value?: string): any {
    throw new Error('Do not use!');
  }

  protected registerPendingUser(user: User): void {
    this.currentlyPendingUsers.set(user.userId, user);
  }

  protected doCleanUp(userId: string): void {
    const interval = this.intervals.get(userId);
    if (interval) {
      clearInterval(interval);
    }
    this.currentlyPendingUsers.delete(userId);
    this.intervals.delete(userId);
  }
}

import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { BaseAuthenticator } from './base-authenticator';
import { Logger } from './../../../services/logger';
import { User } from './../../../model-layer/core/models/user';
import { Authentication } from '../authentication';
import { AuthenticatorValidationResult } from '../interfaces/authenticator';

export class TotpAuthenticator extends BaseAuthenticator {
  public async isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult> {
    if (!value) {
      this.prepareTotpAuthentication(user);
      return { missing: true };
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    const otpValues = Authentication.uriToOtp(pendingUser?.totp as string);
    if (!this.totpService.verify(value, otpValues.secret)) {
      throw new AuthenticationException('TOTP codes do not match!');
    }
    this.doCleanUp(user.userId);
    return { missing: false };
  }

  private prepareTotpAuthentication(user: User): void {
    Logger.debug('Prepare totp auth with user:', user);
    if (!user.totp) {
      throw new Error(`User ${user.username} has to create a totp-uri, first!`);
    }
    const otpValues = Authentication.uriToOtp(user.totp);
    console.log('Received otpValues', otpValues);
    const totp = this.totpService.create(otpValues.secret);
    user.authenticationCredentials.totp = totp;
    this.registerPendingUser(user);
  }
}

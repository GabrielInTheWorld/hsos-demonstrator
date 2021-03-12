import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { BaseAuthenticator } from './base-authenticator';
import { Logger } from './../../../services/logger';
import { User } from './../../../model-layer/core/models/user';
import { Authentication } from '../authentication';
import { AuthenticatorValidationResult } from '../interfaces/authenticator';

export class TotpAuthenticator extends BaseAuthenticator {
  public async isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult> {
    if (!value) {
      Logger.log('Für eine Authentifizierung ist ein TOTP erforderlich.');
      this.prepareTotpAuthentication(user);
      return { missing: true };
    }
    Logger.log(`TOTP "${value}" erhalten. Überprüfe dessen Richtigkeit.`);
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    const otpValues = Authentication.uriToOtp(pendingUser?.totp as string);
    if (!this.totpService.verify(value, otpValues.secret)) {
      throw new AuthenticationException('TOTP codes do not match!');
    }
    this.doCleanUp(user.userId);
    return { missing: false };
  }

  private prepareTotpAuthentication(user: User): void {
    if (!user.totp) {
      throw new Error(`User ${user.username} has to create a totp-uri, first!`);
    }
    const otpValues = Authentication.uriToOtp(user.totp);
    const totp = this.totpService.create(otpValues.secret);
    user.authenticationCredentials.totp = totp;
    this.registerPendingUser(user);
  }
}

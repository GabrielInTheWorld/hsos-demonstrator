import { Hotp } from 'final-otp';
import sendmail from 'sendmail';

import { Logger } from './../../../services/logger';
import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { BaseAuthenticator } from './base-authenticator';
import { User } from './../../../model-layer/core/models/user';
import { Random } from '../../helper';
import { AuthenticatorValidationResult } from '../interfaces/authenticator';

export class EmailAuthenticator extends BaseAuthenticator {
  private sendMailFn = sendmail({});

  public async isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult> {
    if (!value) {
      this.prepareEmailAuthentication(user);
      return { missing: true };
    }
    const pendingUser = this.currentlyPendingUsers.get(user.userId);
    const hotp = pendingUser?.authenticationCredentials.email as Hotp;
    if (!hotp.verify(value)) {
      throw new AuthenticationException('Email code is not correct!');
    }
    return { missing: false };
  }

  private prepareEmailAuthentication(user: User): void {
    const hotp = this.hotpService.create((user.emailSecret as string) || Random.cryptoKey(), Random.randomNumber(8), {
      expiresIn: 600000
    });
    user.authenticationCredentials.email = hotp;
    this.registerPendingUser(user);
    this.sendEmailWithHotp(user.email as string, hotp!.value);
  }

  private sendEmailWithHotp(email: string, hotp: string): void {
    this.sendMailFn(
      {
        from: 'no-reply@demonstrator.com',
        to: email,
        subject: 'Bestätigung einer Authentifizierung',
        html: `Ihr Bestätigungs-Code lautet: ${hotp}\n\r\n\rDieser Code ist zehn Minuten lang gültig.`
      },
      (err, reply) => {
        if (err) {
          Logger.error(err);
        }
        Logger.debug(reply);
      }
    );
  }
}

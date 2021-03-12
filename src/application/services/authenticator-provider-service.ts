import { AuthenticationCredential } from '../model-layer/core/models/authentication/authentication-credential';
import { AuthenticationException } from './../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from '../model-layer/core/models/authentication/authentication-types';
import { Authenticator } from '../util/authentication/interfaces/authenticator';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';
import { EmailAuthenticator } from './../util/authentication/implementations/email-authenticator';
import { FidoAuthenticator } from './../util/authentication/implementations/fido-authenticator';
import { Logger } from './logger';
import { MissingAuthenticationException } from './../model-layer/core/exceptions/missing-authentication-exception';
import { PasswordAuthenticator } from './../util/authentication/implementations/password-authenticator';
import { TotpAuthenticator } from './../util/authentication/implementations/totp-authenticator';
import { User } from '../model-layer/core/models/user';

export class AuthenticatorProviderService implements AuthenticatorProvider {
  private readonly authenticators: { [key in AuthenticationType]?: Authenticator } = {
    password: new PasswordAuthenticator(),
    totp: new TotpAuthenticator(),
    email: new EmailAuthenticator(),
    fido: new FidoAuthenticator()
  };

  public async readAuthenticationValues(user: User, values: AuthenticationCredential): Promise<void> {
    const missingTypes: { [key in AuthenticationType]?: { [key: string]: any } } = {};

    if (!Object.keys(this.authenticators).length) {
      throw new AuthenticationException('No authenticators provided!');
    }
    for (const key of user.authenticationTypes) {
      if (!this.authenticators[key]) {
        throw new AuthenticationException(`Authenticator ${key} not provided!`);
      }
      const result = await this.authenticators[key]?.isAuthenticationTypeMissing(user, values[key]);
      Logger.debug('Result from authenticationType:', result);
      if (result?.missing) {
        missingTypes[key] = result.additionalData;
      }
    }
    if (!!Object.keys(missingTypes).length) {
      throw new MissingAuthenticationException(user, missingTypes);
    }
  }

  public async writeAuthenticationValues(user: User): Promise<User> {
    if (!Object.keys(this.authenticators).length) {
      throw new AuthenticationException('No authenticators provided!');
    }
    for (const key of user.authenticationTypes) {
      if (!this.authenticators[key]) {
        throw new AuthenticationException(`Authenticator ${key} not provided!`);
      }
      user = await this.authenticators[key]!.prepareAuthenticationType(user, user[key]);
    }
    return user;
  }

  public getAvailableAuthenticationTypes(): AuthenticationType[] {
    return Object.keys(this.authenticators) as AuthenticationType[];
  }
}

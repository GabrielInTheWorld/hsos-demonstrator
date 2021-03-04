// import { TotpAuthenticator } from './../util/authentication/implementations/totp-authenticator';
import { AuthenticationType } from './../model-layer/user/authentication-types';
import { User } from './../model-layer/core/models/user';
import { AuthenticationCredential } from '../model-layer/user/authentication-credential';

export interface AuthenticatorProvider {
  readAuthenticationValues(user: User, types: AuthenticationCredential): Promise<void>;
  writeAuthenticationValues(user: User): Promise<User>;
  getAvailableAuthenticationTypes(): AuthenticationType[];

  // getTotpValidator(): TotpAuthenticator;
}

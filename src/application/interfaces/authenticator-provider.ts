import { AuthenticationCredential } from '../model-layer/core/models/authentication/authentication-credential';
import { AuthenticationType } from '../model-layer/core/models/authentication/authentication-types';
import { User } from './../model-layer/core/models/user';

export interface AuthenticatorProvider {
  readAuthenticationValues(user: User, types: AuthenticationCredential): Promise<void>;
  writeAuthenticationValues(user: User): Promise<User>;
  getAvailableAuthenticationTypes(): AuthenticationType[];
}

import { AuthenticationException } from '../../../model-layer/core/exceptions/authentication-exception';
import { AuthenticationType } from '../../../model-layer/user/authentication-types';
import { BaseAuthenticator } from './base-authenticator';
import { MissingAuthenticationException } from '../../../model-layer/core/exceptions/missing-authentication-exception';
import { User } from './../../../model-layer/core/models/user';
import { AuthenticatorValidationResult } from '../interfaces/authenticator';

export class BiometricsAuthenticator extends BaseAuthenticator {
  public isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult> {
    throw new Error('Method not implemented.');
  }
}

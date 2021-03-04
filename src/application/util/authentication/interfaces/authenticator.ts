import { User } from './../../../model-layer/core/models/user';

export interface AuthenticatorValidationResult {
  missing: boolean;
  additionalData?: { [key: string]: any };
}

export interface Authenticator {
  /**
   * During authentication process, through this function a user-object is checked, if an authentication type is
   * not provided for an authentication process.
   *
   * @param user A user whose credentials will be checked.
   * @param value A value, that is for a given credential provided.
   *
   * @returns It returns a boolean to summarize, which authentication types are not provided.
   */
  isAuthenticationTypeMissing(user: User, value?: string): Promise<AuthenticatorValidationResult>;

  /**
   * During creation process, through this function a user-object is prepared
   * to authenticate with a given authentication type.
   *
   * @param user A user who is newly created.
   * @param value A value which is given upon the creation process.
   */
  prepareAuthenticationType(user: User, value?: any): Promise<User>;

  /**
   * @deprecated Do not use! Use `isAuthenticationTypeMissing` instead!
   * @param user
   * @param value
   */
  checkAuthenticationType(user: User, value?: string): void;
  /**
   * @deprecated Do not use!
   * @param user
   * @param value
   */
  writeAuthenticationType(user: User, value?: string): any;
}

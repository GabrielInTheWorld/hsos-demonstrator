import { AuthenticationCredential } from './../../user/authentication-credential';
import { AuthenticationType } from '../../user/authentication-types';
import { BaseModel } from '../base/base-model';
import { PublicKeyObject } from './fido';

export class User extends BaseModel<User> {
  public static readonly COLLECTIONSTRING = 'user';

  public readonly username: string;
  public readonly userId: string;

  /**
   * An email-address of a user.
   */
  public readonly email?: string;

  /**
   * The password of a user.
   */
  public password?: string;

  /**
   * Biometrics information of a user, if available.
   */
  public readonly biometrics?: string;

  /**
   * A secret, which is used to generate an hotp for authenticating with an email.
   */
  public readonly emailSecret?: string;

  /**
   * A uri to generating totps.
   */
  public readonly totp?: string;

  public fido?: PublicKeyObject;

  /**
   * @deprecated
   * The property `t0` for generating a totp-token.
   */
  public readonly totpT0?: number;

  /**
   * @deprecated
   * A secret used for generating a totp-token.
   */
  public readonly totpSecret?: string;

  /**
   * Property to hold some data for authentication while authenticating.
   */
  public readonly authenticationCredentials: AuthenticationCredential = {};

  /**
   * Property to determine, with which types a user wants to authenticate.
   */
  public authenticationTypes: AuthenticationType[] = [];

  public constructor(input?: Partial<User>) {
    super(User.COLLECTIONSTRING, input);
    if (input?.authenticationTypes) {
      this.authenticationTypes = input?.authenticationTypes;
    }
  }
}

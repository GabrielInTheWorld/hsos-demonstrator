import { AuthenticationType } from './../../user/authentication-types';
import { BaseException } from './base-exception';
import { User } from './../models/user';

export interface MissingAuthenticationExceptionData {
  [key: string]: { [key: string]: any } | undefined;
}

export class MissingAuthenticationException extends BaseException {
  private readonly user: User;
  private readonly missingType: AuthenticationType[] = [];
  private readonly data: MissingAuthenticationExceptionData = {};

  public constructor(user: User, missingTypes: MissingAuthenticationExceptionData) {
    super(`Types ${Object.keys(missingTypes)} are missing in authentication by user: ${user.userId}`);
    this.user = user;
    this.missingType = Object.keys(missingTypes) as AuthenticationType[];
    this.data = missingTypes;
  }

  public getUser(): User {
    return this.user;
  }

  public getMissingTypes(): AuthenticationType[] {
    return this.missingType;
  }

  public getData(): MissingAuthenticationExceptionData {
    return this.data;
  }
}

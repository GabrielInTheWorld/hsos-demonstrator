import { BaseException } from './base-exception';

export class InjectionException extends BaseException {
  public constructor(message: string) {
    super(`InjectionError: ${message}`);
  }
}

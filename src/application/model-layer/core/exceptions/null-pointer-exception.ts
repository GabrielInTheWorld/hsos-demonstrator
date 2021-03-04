import { BaseException } from './base-exception';

export class NullPointerException extends BaseException {
  public constructor(instance: string) {
    super(`${instance} is undefined.`);
  }
}

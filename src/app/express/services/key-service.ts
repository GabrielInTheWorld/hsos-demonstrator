import { KeyHandler } from '../interfaces/key-handler';

const DEV_KEY = 'auth-dev-key';

export class KeyService extends KeyHandler {
  public getTokenKey(): string {
    return DEV_KEY;
  }

  public getCookieKey(): string {
    return DEV_KEY;
  }
}

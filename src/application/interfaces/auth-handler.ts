import { Ticket, Token } from '../model-layer/core/models/ticket';
import { Validation } from '../model-layer/core/models/validation';

export abstract class AuthHandler {
  public static readonly COOKIE_NAME = 'refreshId';

  public abstract confirmAdditionalCredentials(
    username: string,
    additional: { [key: string]: any }
  ): Promise<Validation<Ticket>>;
  public abstract whoAmI(cookieAsString: string): Promise<Validation<Ticket>>;
  public abstract logout(token: Token): void;
  public abstract reset(): Promise<void>;
}

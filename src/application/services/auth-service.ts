import { MissingAuthenticationException } from './../model-layer/core/exceptions/missing-authentication-exception';
import { AuthenticatorProviderService } from './authenticator-provider-service';
import { AuthHandler } from '../interfaces/auth-handler';
import { Factory, Inject } from '../model-layer/core/modules/decorators';
import { HashingHandler } from '../interfaces/hashing-handler';
import { HashingService } from './hashing-service';
import { Logger } from './logger';
import { SessionService } from './session-service';
import { Ticket, Token } from '../model-layer/core/models/ticket';
import { TicketHandler } from '../interfaces/ticket-handler';
import { TicketService } from './ticket-service';
import { UserHandler } from '../model-layer/user/user-handler';
import { UserService } from '../model-layer/user/user-service';
import { Validation } from '../interfaces/validation';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';

export class AuthService implements AuthHandler {
  @Inject(UserService)
  private readonly userHandler: UserHandler;

  @Factory(TicketService)
  private readonly ticketHandler: TicketHandler;

  @Factory(HashingService)
  private readonly hashHandler: HashingHandler;

  @Inject(SessionService)
  private readonly sessionHandler: SessionService;

  @Inject(AuthenticatorProviderService)
  private readonly provider: AuthenticatorProvider;

  public async login(username: string, password?: string): Promise<Validation<Ticket>> {
    try {
      const user = await this.userHandler.getUserByUsername(username);
      await this.provider.readAuthenticationValues(user, { password });
      return await this.ticketHandler.create(user);
    } catch (e) {
      Logger.error(e);
      if (e instanceof MissingAuthenticationException) {
        console.log('error in auth:', e.getData());
        return { isValid: false, message: e.message, reason: e.getMissingTypes(), data: e.getData() };
      }
      return { isValid: false, message: e.message };
    }
  }

  public async confirmAdditionalCredentials(
    username: string,
    additional: { [key: string]: any }
  ): Promise<Validation<Ticket>> {
    try {
      const user = await this.userHandler.getUserByUsername(username);
      Logger.warn('user:', user);
      await this.provider.readAuthenticationValues(user, additional);
      Logger.warn('after provider service');
      return await this.ticketHandler.create(user);
    } catch (e) {
      Logger.error(e);
      if (e instanceof MissingAuthenticationException) {
        return { isValid: false, message: e.message, reason: e.getMissingTypes() };
      }
      return { isValid: false, message: e.message };
    }
  }

  public async whoAmI(cookieAsString: string): Promise<Validation<Ticket>> {
    Logger.debug(`whoAmI -- cookie: ${cookieAsString}`);
    const answer = await this.ticketHandler.refresh(cookieAsString);
    return answer;
  }

  public logout(token: Token): void {
    this.sessionHandler.clearSessionById(token.sessionId);
  }

  public async getListOfSessions(): Promise<string[]> {
    return await this.sessionHandler.getAllActiveSessions();
  }

  public async clearUserSessionById(sessionId: string): Promise<Validation<void>> {
    await this.sessionHandler.clearSessionById(sessionId);
    return { isValid: true, message: 'successful' };
  }

  public async clearAllSessionsExceptThemselves(sessionId: string): Promise<Validation<void>> {
    await this.sessionHandler.clearAllSessionsExceptThemselves(sessionId);
    return { isValid: true, message: 'successful' };
  }

  public toHash(input: string): string {
    return this.hashHandler.hash(input);
  }

  public isEquals(toHash: string, toCompare: string): boolean {
    return this.hashHandler.isEquals(toHash, toCompare);
  }

  public async reset(): Promise<void> {
    await this.userHandler.reset();
  }
}

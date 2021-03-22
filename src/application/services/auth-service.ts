import { AuthGuard } from 'auth-guard';
import { Factory, Inject } from 'final-di';

import { AuthHandler } from '../interfaces/auth-handler';
// import { Factory, Inject } from '../model-layer/core/modules/decorators';
import { Logger } from './logger';
import { SessionService } from './session-service';
import { Ticket, Token } from '../model-layer/core/models/ticket';
import { TicketHandler } from '../interfaces/ticket-handler';
import { TicketService } from './ticket-service';
import { UserHandler } from '../model-layer/user/user-handler';
import { UserService } from '../model-layer/user/user-service';
import { Validation } from '../model-layer/core/models/validation';

export class AuthService extends AuthHandler {
  @Inject(UserService)
  private readonly userHandler: UserHandler;

  @Factory(TicketService)
  private readonly ticketHandler: TicketHandler;

  @Inject(SessionService)
  private readonly sessionHandler: SessionService;

  @Inject(AuthGuard)
  private readonly provider: AuthGuard;

  public async confirmAdditionalCredentials(
    username: string,
    additional: { [key: string]: any }
  ): Promise<Validation<Ticket>> {
    try {
      const user = await this.userHandler.getUserByUsername(username);
      this.provider.login(user, additional);
      return await this.ticketHandler.create(user);
    } catch (e) {
      Logger.error(e);
      if (e.missingTypes) {
        return { isValid: false, message: e.message, reason: e.missingTypes, data: e.data };
      }
      return { isValid: false, message: e.message };
    }
  }

  public async whoAmI(cookieAsString: string): Promise<Validation<Ticket>> {
    const answer = await this.ticketHandler.refresh(cookieAsString);
    return answer;
  }

  public logout(token: Token): void {
    this.sessionHandler.clearSessionById(token.sessionId);
  }

  public async reset(): Promise<void> {
    await this.userHandler.reset();
  }
}

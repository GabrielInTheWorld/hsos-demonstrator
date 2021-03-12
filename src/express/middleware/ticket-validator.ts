import express from 'express';

import { AuthHandler } from '../../application/interfaces/auth-handler';
import { Factory } from '../../application/model-layer/core/modules/decorators';
import { TicketHandler } from '../../application/interfaces/ticket-handler';
import { TicketService } from '../../application/services/ticket-service';
import { Validator } from '../interfaces/validator';

export class TicketValidator extends Validator {
  @Factory(TicketService)
  private readonly ticketHandler: TicketHandler;

  public async validate(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ): Promise<express.Response | void> {
    if (!request.headers || !request.cookies) {
      return this.sendResponse(false, 'Undefined headers or cookies', response, 400);
    }
    const tokenEncoded = (request.headers['authentication'] || request.headers['authorization']) as string;
    const cookieEncoded = request.cookies[AuthHandler.COOKIE_NAME];
    const answer = await this.ticketHandler.validateTicket(tokenEncoded, cookieEncoded);
    if (answer.isValid) {
      response.locals['token'] = answer.result;
      if (answer.header && answer.header.token) {
        response.locals['newToken'] = answer.header.token;
      }
      next();
    } else {
      return this.sendResponse(false, answer.message, response, 403);
    }
  }
}

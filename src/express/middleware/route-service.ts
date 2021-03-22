import express, { Request, Response } from 'express';
import path from 'path';

import { AuthHandler } from '../../application/interfaces/auth-handler';
import { AuthService } from '../../application/services/auth-service';
import { Factory, Inject } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';
import { RouteHandler } from '../interfaces/route-handler';
import { Token } from '../../application/model-layer/core/models/ticket';

export class RouteService extends RouteHandler {
  @Factory(AuthService)
  private readonly authHandler: AuthHandler;

  public async confirmLogin(request: express.Request, response: express.Response): Promise<void> {
    const username = request.body.username;
    Logger.log(`Benutzer ${username} meldet sich an.`);

    const result = await this.authHandler.confirmAdditionalCredentials(username, { ...request.body });
    if (!result.result) {
      this.sendResponse(false, result.message, response, 403, result.data, result.reason);
      return;
    }

    response.locals['newToken'] = result.result.token;
    response.locals['newCookie'] = result.result.cookie;
    Logger.log(`Authentifizierung für ${username} erfolgreich.`);
    this.sendResponse(true, 'Authentication successful!', response);
  }

  public async whoAmI(request: express.Request, response: express.Response): Promise<void> {
    const cookieAsString = request.cookies[AuthHandler.COOKIE_NAME];
    const result = await this.authHandler.whoAmI(cookieAsString);
    if (!result.isValid || (result.isValid && !result.result)) {
      response.clearCookie(AuthHandler.COOKIE_NAME);
      this.sendResponse(false, 'Failure', response, 403);
      return;
    }
    response.locals['newToken'] = result.result?.token;
    Logger.log(`Sitzung für ${result.result?.user.username} valide.`);
    this.sendResponse(true, 'Authentication successful!', response);
  }

  public logout(request: express.Request, response: express.Response): void {
    const token = response.locals['token'] as Token;
    try {
      this.authHandler.logout(token);
      response.clearCookie(AuthHandler.COOKIE_NAME);
      Logger.log('Abgemeldet!');
      this.sendResponse(true, 'Successfully signed out!', response);
    } catch (e) {
      this.sendResponse(false, e, response, 403);
    }
  }

  public async notFound(request: Request, response: Response): Promise<void> {
    this.sendResponse(false, 'Your requested resource is not found...', response, 404);
  }

  public index(_: any, response: Response): void {
    const index = path.join(path.resolve('client/dist/client'), 'index.html');
    response.sendFile(index);
  }

  public reset(req: Request, response: Response): void {
    this.authHandler.reset().then(() => this.sendResponse(true, 'successful', response));
  }
}

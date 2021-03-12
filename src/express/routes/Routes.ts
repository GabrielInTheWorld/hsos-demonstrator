import * as express from 'express';

import { Factory } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';
import { RouteHandler } from '../interfaces/route-handler';
import { RouteService } from '../middleware/route-service';
import { TicketValidator } from '../middleware/ticket-validator';
import { Validator } from '../interfaces/validator';

export const SECURE_URL_PREFIX = '/api';

export function getSecureUrl(urlPath: string): string {
  return `${SECURE_URL_PREFIX}${urlPath}`;
}

export class Routes {
  @Factory(TicketValidator)
  private readonly validator: Validator;

  @Factory(RouteService)
  private readonly routeHandler: RouteHandler;

  private readonly app: express.Application;

  public constructor(app: express.Application) {
    this.app = app;
  }

  public initRoutes(): void {
    this.configRoutes();
    this.initPublicRoutes();
    this.initApiRoutes();
  }

  private configRoutes(): void {
    this.app.all('*', (req, res, next) => this.handleOptionsRequest(req, res, next));
    this.app.all('*', (req, _, next) => this.logRequestInformation(req, next));
    this.app.all(`${SECURE_URL_PREFIX}/*`, (request, response, next) =>
      this.validator.validate(request, response, next)
    );
  }

  private initPublicRoutes(): void {
    this.app.get('/', (request, response) => this.routeHandler.index(request, response));
    this.app.get('/ping', (request, response) => {
      response.json('======== Everything okay! ========');
    });

    this.app.get('/reset', (request, response) => this.routeHandler.reset(request, response));
    this.app.post('/confirm-login', (request, response) => this.routeHandler.confirmLogin(request, response));
    this.app.get('/callback', (req, res) => this.routeHandler.index(req, res));
    this.app.post('/who-am-i', (request, response) => this.routeHandler.whoAmI(request, response));
  }

  private initApiRoutes(): void {
    this.app.post(this.getSecureUrl('/logout'), (request, response) => this.routeHandler.logout(request, response));
  }

  private logRequestInformation(req: express.Request, next: express.NextFunction): void {
    Logger.log(`Request von ${req.headers.origin}: ${req.method} -- ${req.originalUrl}`);
    next();
  }

  private handleOptionsRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.method.toLowerCase() === 'options') {
      res.status(200).send({ success: true, message: 'successful' });
    } else {
      next();
    }
  }

  private getSecureUrl(urlPath: string): string {
    return `${SECURE_URL_PREFIX}${urlPath}`;
  }
}

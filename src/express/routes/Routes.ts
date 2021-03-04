import * as express from 'express';

import { Factory } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';
import { RouteHandler } from '../interfaces/route-handler';
import RouteService from '../middleware/route-service';
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
    this.initPrivateRoutes();
    this.initApiRoutes();
  }

  private configRoutes(): void {
    this.app.all('*', (req, _, next) => this.logRequestInformation(req, next));
    this.app.all('*', (req, res, next) => this.handleOptionsRequest(req, res, next));
    this.app.all(`${SECURE_URL_PREFIX}/*`, (request, response, next) =>
      this.validator.validate(request, response, next)
    );
  }

  private initPublicRoutes(): void {
    this.app.get('/', (request, response) => this.routeHandler.index(request, response));
    this.app.get('/ping', (request, response) => {
      response.json('======== Everything okay! ========');
    });

    //////////////////////////////////////////////
    /////////////// FIDO2 ////////////////////////
    //////////////////////////////////////////////

    // this.app.get('/make-credential', (request, response) => this.routeHandler.getMakeCredential(request, response));
    // this.app.post('/make-credential', (request, response) => this.routeHandler.postMakeCredential(request, response));
    // this.app.post('/fido-register', (request, response) => {
    //   Logger.debug('Received "fido-register"', request.body);
    //   this.routeHandler.fido(request, response);
    // });
    this.app.post('/fido-login-request', (request, response) => this.routeHandler.fidoLoginRequest(request, response));
    this.app.post('/fido-login-confirm', (request, response) => this.routeHandler.fidoLoginConfirm(request, response));

    //////////////////////////////////////////////

    this.app.get('/reset', (request, response) => this.routeHandler.reset(request, response));
    this.app.post('/login', (request, response) => this.routeHandler.login(request, response)); // Sends token
    this.app.post('/confirm-login', (request, response) => this.routeHandler.login2(request, response));
    this.app.get('/callback', (req, res) => this.routeHandler.index(req, res));
    this.app.post('/who-am-i', (request, response) => this.routeHandler.whoAmI(request, response));
  }
  private initPrivateRoutes(): void {
    this.app.post(
      '/authenticate',
      (request, response, next) => this.validator.validate(request, response, next),
      (request, response) => this.routeHandler.authenticate(request, response)
    );
    this.app.post('/hash', (request, response) => this.routeHandler.hash(request, response));
    this.app.post('/is-equals', (request, response) => this.routeHandler.isEquals(request, response));
  }

  private initApiRoutes(): void {
    this.app.get(this.getSecureUrl('/hello'), (req, res) => this.routeHandler.secureIndex(req, res));
    this.app.post(this.getSecureUrl('/logout'), (request, response) => this.routeHandler.logout(request, response));
    this.app.get(this.getSecureUrl('/list-sessions'), (req, res) => this.routeHandler.getListOfSessions(req, res));
    this.app.post(this.getSecureUrl('/clear-all-sessions-except-themselves'), (req, res) =>
      this.routeHandler.clearAllSessionsExceptThemselves(req, res)
    );
    this.app.post(this.getSecureUrl('/clear-session-by-id'), (req, res) =>
      this.routeHandler.clearUserSessionById(req, res)
    );
  }

  private logRequestInformation(req: express.Request, next: express.NextFunction): void {
    Logger.log(`${req.protocol}://${req.headers.origin}: ${req.method} -- ${req.originalUrl}`);
    Logger.debug('Expected content-size:', req.headers['content-length']);
    Logger.debug('Incoming request with the following headers:\n', req.headers);
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

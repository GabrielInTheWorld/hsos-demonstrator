import express from 'express';

import { Middleware } from '../base/middleware';

export abstract class RouteHandler extends Middleware {
  public static readonly VIEWS_PATH = 'views';

  /**
   * Function to test connectivity to auth-service
   *
   * @param response HttpResponse
   */
  public abstract index(request: express.Request, response: express.Response): void;
  /**
   * Function to test an api connection.
   *
   * @param response HttpResponse
   */
  public abstract secureIndex(request: express.Request, response: express.Response): void;

  /**
   * Function to send back { userId, sessionId } after validating current access-token.
   *
   * @param response HttpResponse
   */
  public abstract authenticate(request: express.Request, response: express.Response): void;
  // public abstract getMakeCredential(request: express.Request, response: express.Response): void;
  // public abstract postMakeCredential(request: express.Request, response: express.Response): void;

  // public abstract fido(req: express.Request, res: express.Response): void;
  public abstract fidoLoginRequest(req: express.Request, res: express.Response): void;
  public abstract fidoLoginConfirm(req: express.Request, res: express.Response): void;
  public abstract notFound(request: express.Request, response: express.Response): Promise<void>;

  public abstract login(request: express.Request, response: express.Response): Promise<void>;
  public abstract login2(request: express.Request, response: express.Response): Promise<void>;
  public abstract whoAmI(request: express.Request, response: express.Response): Promise<void>;
  public abstract logout(request: express.Request, response: express.Response): void;
  public abstract getListOfSessions(request: express.Request, response: express.Response): Promise<void>;
  public abstract clearUserSessionById(request: express.Request, response: express.Response): void;
  public abstract clearAllSessionsExceptThemselves(request: express.Request, response: express.Response): void;
  public abstract hash(request: express.Request, response: express.Response): void;
  public abstract isEquals(request: express.Request, response: express.Response): void;

  public abstract reset(request: express.Request, response: express.Response): void;
}

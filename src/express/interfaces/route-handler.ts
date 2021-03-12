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
  public abstract notFound(request: express.Request, response: express.Response): Promise<void>;

  public abstract confirmLogin(request: express.Request, response: express.Response): Promise<void>;
  public abstract whoAmI(request: express.Request, response: express.Response): Promise<void>;
  public abstract logout(request: express.Request, response: express.Response): void;

  public abstract reset(request: express.Request, response: express.Response): void;
}

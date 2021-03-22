import cookieParser from 'cookie-parser';
import express, { request } from 'express';
import { Inject, Injectable } from 'final-di';
import { createServer, Server } from 'http';
import path from 'path';

import { BaseServer } from '../interfaces/base-server';
import { ConfigService } from '../../application/services/config-service';
// import { Constructable, Inject } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';
import { Routes } from '../routes/Routes';

@Injectable(BaseServer)
export default class AuthenticationServer extends BaseServer {
  public static readonly ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:4200',
    'http://localhost:4210',
    'http://localhost:8010'
  ];

  public name = 'AuthenticationServer';

  @Inject(ConfigService)
  private readonly config: ConfigService;

  private app: express.Application;
  private server: Server;
  private routes: Routes;

  private readonly CLIENT_PATH = 'client/dist/client';

  private readonly port: number;

  public constructor(input: { port: number }) {
    super();
    this.port = input.port;
    this.createApp();
    this.createServer();
    this.initializeConfig();
    this.initializeRoutes();
    this.initClient();
  }
  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): Server {
    return this.server;
  }

  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private initializeConfig(): void {
    this.app.use((req, res, next) => this.corsFunction(req, res, next));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    this.routes = new Routes(this.app);
    this.routes.initRoutes();
  }

  private initClient(): void {
    this.app.use('/', express.static(path.resolve(this.CLIENT_PATH)));
  }

  private corsFunction(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const origin = req.headers.origin;
    const requestingOrigin = Array.isArray(origin) ? origin.join(' ') : origin || '';
    Logger.debug('Anfragender Client:', requestingOrigin);
    if (AuthenticationServer.ALLOWED_ORIGINS.indexOf(requestingOrigin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', requestingOrigin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, DELETE, PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, X-Content-Type, Authentication, Authorization, X-Access-Token, Accept'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
  }
}

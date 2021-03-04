import { Server } from 'http';
import { WebsocketHandler } from 'reactive-websocket';
import 'reflect-metadata';

import AuthenticationServer from './express/server/authentication-server';
import { BaseServer } from './express/interfaces/base-server';
import { Config } from './application/util/config';
import { Factory, Inject } from './application/model-layer/core/modules/decorators';
import { FidoProviderService } from './application/services/fido-provider-service';
import { Logger } from './application/services/logger';

export class Application {
  public static readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8000;

  public get port(): number {
    return Application.PORT;
  }

  @Factory(AuthenticationServer, { port: Application.PORT })
  private readonly httpServer: BaseServer;

  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  @Inject(FidoProviderService)
  private readonly fidoService: FidoProviderService;

  public start(): Server {
    const server = this.httpServer.getServer().listen(Application.PORT, () => {
      console.log('Server start');
      Logger.log(`Server is running on port ${Application.PORT}`);
      Logger.debug('Is production mode:', Config.isProductionMode());
    });
    this.websocket.initWebsocket({
      httpServer: server
    });
    return server;
  }
}

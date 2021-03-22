import { Server } from 'http';
import { WebsocketHandler } from 'reactive-websocket';
import 'reflect-metadata';

import AuthenticationServer from './express/server/authentication-server';
import { BaseServer } from './express/interfaces/base-server';
import { Factory, Inject } from './application/model-layer/core/modules/decorators';
import { FidoProviderService } from './application/services/fido-provider-service';
import { Logger } from './application/services/logger';
import { MessageHandler } from './application/interfaces/message-handler';
import { MessageService } from './application/services/message-service';
import { WebsocketUserService } from './api/websocket-user.service';

export class Application {
  public static readonly PORT: number = parseInt(process.env.PORT || '', 10) || 8000;

  public get port(): number {
    return Application.PORT;
  }

  @Factory(AuthenticationServer, { port: Application.PORT })
  private readonly httpServer: BaseServer;

  @Factory(MessageService)
  private readonly messageHandler: MessageHandler;

  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  @Inject(WebsocketUserService)
  private readonly websocketUserService: WebsocketUserService;

  @Inject(FidoProviderService)
  private readonly fidoService: FidoProviderService;

  public start(): Server {
    const server = this.httpServer.getServer().listen(Application.PORT, () => {
      console.log('Server start');
      Logger.log(`Server ist unter Port ${Application.PORT} verfügbar.`);
    });
    this.websocket.initWebsocket({
      httpServer: server,
      onClientConnect: socket => Logger.log(`Client ${socket.id} verbindet sich...`),
      logger: (...messages: any[]) => Logger.debug('Websocket:', ...messages)
    });
    this.websocketUserService.init();
    return server;
  }
}

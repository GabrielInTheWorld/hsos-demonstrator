import { WebsocketHandler } from 'reactive-websocket';

import { Constructable, Inject } from '../application/model-layer/core/modules/decorators';
import { Logger } from '../application/services/logger';
import { UserService } from '../application/model-layer/user/user-service';

interface SocketData {
  socketId: string;
  data: any;
}

@Constructable(WebsocketUserService)
export class WebsocketUserService {
  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  @Inject(UserService)
  private readonly userHandler: UserService;

  public init(): void {
    this.websocket
      .fromEvent<any>('all-users')
      .subscribe(
        async message => await this.sendToSocket(message, 'all-users', () => this.userHandler.getAllUsersForClient())
      );
    this.websocket
      .fromEvent<any>('create-user')
      .subscribe(
        async message =>
          await this.sendToSocket(message, 'create-user', (data: any, values: any) =>
            this.userHandler.onCreateEvent(data, values)
          )
      );
    this.websocket
      .fromEvent<any>('get-user')
      .subscribe(
        async message => await this.sendToSocket(message, 'get-user', data => this.userHandler.onGetEvent(data))
      );
    this.websocket
      .fromEvent<any>('update-user')
      .subscribe(
        async message =>
          await this.sendToSocket(message, 'update-user', (data: any, values: any) =>
            this.userHandler.onUpdateEvent(data, values)
          )
      );
    this.websocket
      .fromEvent<any>('delete-user')
      .subscribe(
        async message => await this.sendToSocket(message, 'delete-user', data => this.userHandler.onDeleteEvent(data))
      );
    this.websocket
      .fromEvent<any>('reset-database')
      .subscribe(
        async message => await this.sendToSocket(message, 'reset-database', () => this.userHandler.onResetEvent())
      );
  }

  private async sendToSocket(
    message: SocketData,
    event: string,
    fn: (data: any, values?: any) => Promise<any>
  ): Promise<void> {
    Logger.debug('Incoming request:', message, event);
    const { socketId, data }: SocketData = message;
    try {
      Logger.debug('SocketId', socketId);
      const result = await fn(data, data);
      Logger.debug('Result from fn:', result);
      if (result) {
        this.websocket.emit(socketId, { event, data: result });
      } else {
        this.websocket.emit(socketId, { event: 'all-users', data: await this.userHandler.getAllUsersForClient() });
      }
    } catch (e) {
      Logger.warn('An error occurred:', e);
      const additionalData = e.additionalData ? e.additionalData : e;
      this.websocket.emit(socketId, { event, data: additionalData });
    }
  }
}

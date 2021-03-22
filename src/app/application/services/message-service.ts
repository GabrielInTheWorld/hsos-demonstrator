import { Inject } from 'final-di';
import { WebsocketHandler } from 'reactive-websocket';

import { MessageHandler } from '../interfaces/message-handler';
// import { Inject } from '../model-layer/core/modules/decorators';
import { Logger } from './logger';

export class MessageService implements MessageHandler {
  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  private readonly _logMessageObservable = Logger.getLogMessagesObservable();

  public constructor() {
    this._logMessageObservable.subscribe(nextMessage => {
      this.websocket.broadcastAll({ event: 'server-message', data: nextMessage });
    });
  }
}

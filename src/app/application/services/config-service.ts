import { AuthGuard } from 'auth-guard';
import { Inject } from 'final-di';
import { WebsocketHandler } from 'reactive-websocket';

import { AuthenticationType } from '../model-layer/core/models/authentication/authentication-types';
import { Config } from '../util/config';
import { Logger } from './logger';

export class ConfigService {
  @Inject(AuthGuard, {
    logger: Logger.getInstance(),
    expectedOrigins: [Config.localClientUrl, Config.localServerUrl],
    domain: 'no-reply@demonstrator.com'
  })
  private readonly authGuard: AuthGuard;

  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  public constructor() {
    this.websocket.fromEvent('all-authentication-types').subscribe(event => {
      this.websocket.broadcastAll({
        event: 'all-authentication-types',
        data: this.getAvailableAuthenticationMethods()
      });
    });
  }

  public getAvailableAuthenticationMethods(): AuthenticationType[] {
    return this.authGuard.getAvailableAuthenticators();
  }
}

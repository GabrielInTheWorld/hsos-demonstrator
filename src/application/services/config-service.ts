import { AuthGuard } from 'auth-guard';
import { WebsocketHandler } from 'reactive-websocket';

import { AuthenticationType } from '../model-layer/core/models/authentication/authentication-types';
import { Inject } from '../model-layer/core/modules/decorators';
import { Config } from '../util/config';

export class ConfigService {
  @Inject(AuthGuard, {
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

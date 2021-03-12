import { WebsocketHandler } from 'reactive-websocket';

import { AuthenticationType } from '../model-layer/core/models/authentication/authentication-types';
import { AuthenticatorProvider } from '../interfaces/authenticator-provider';
import { AuthenticatorProviderService } from './authenticator-provider-service';
import { Inject } from '../model-layer/core/modules/decorators';

export class ConfigService {
  @Inject(AuthenticatorProviderService)
  private readonly provider: AuthenticatorProvider;

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
    return this.provider.getAvailableAuthenticationTypes();
  }
}

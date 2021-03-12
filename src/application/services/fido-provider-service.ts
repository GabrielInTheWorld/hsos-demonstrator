import { Base64 } from 'base-coding';
import { FidoService } from 'custom-fido-library';
import { WebsocketHandler } from 'reactive-websocket';

import { Config } from '../util/config';
import { Inject } from '../model-layer/core/modules/decorators';
import { Random } from '../util/helper';
import { Logger } from './logger';

enum FidoAuthenticationStep {
  REQUEST = 'request',
  CHALLENGE = 'challenge',
  CREDENTIAL = 'credential'
}

interface FidoAuthentication {
  event: FidoAuthenticationStep;
  content?: any;
}

export class FidoProviderService {
  @Inject(WebsocketHandler)
  private readonly websocket: WebsocketHandler;

  private readonly pendingRegister: { [key: string]: string } = {};

  private readonly localClientUrl = 'http://localhost:4200';
  private readonly localServerUrl = 'http://localhost:8000';

  public async register(
    username: string,
    userId?: string,
    attachment: AuthenticatorAttachment = 'cross-platform'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const publicKeyCredentialCreationOptions = FidoService.getRegisterOptions({
        username,
        userId,
        authenticatorAttachment: attachment
      });
      const id = userId || Random.id();
      publicKeyCredentialCreationOptions.user = {
        id: Base64.encode(id),
        name: username,
        displayName: username
      };
      this.pendingRegister[id] = publicKeyCredentialCreationOptions.challenge as string;
      const subscription = this.websocket
        .broadcastAll<any>({
          event: 'fido-register',
          data: {
            event: FidoAuthenticationStep.CHALLENGE,
            content: { publicKeyCredentialCreationOptions, userId: id }
          }
        })
        .subscribe(message => {
          try {
            resolve(this.onChallenge(message.socketId, message.data));
          } catch (e) {
            reject(e);
          }
          setTimeout(() => subscription.unsubscribe(), 10);
        });
    });
  }

  private async onChallenge(socketId: string, request: FidoAuthentication): Promise<any> {
    if (!request.content || !request.content.credential) {
      throw new Error('No credentials provided!\n\rRETURN!');
    }
    const userId = request.content.userId;
    const credential = request.content.credential;
    const clientData = JSON.parse(Base64.decode(credential.response.clientDataJSON));
    Logger.debug('credential:', clientData);
    return FidoService.verifyAttestationObject(credential, {
      challenge: this.pendingRegister[userId],
      origin: Config.isProductionMode() ? this.localServerUrl : this.localClientUrl
    });
  }
}

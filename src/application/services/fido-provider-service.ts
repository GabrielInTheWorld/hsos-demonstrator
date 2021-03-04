import { Fido2Lib } from 'fido2-library';
import { WebsocketHandler } from 'reactive-websocket';
import { Base64 } from 'base-coding';

import { Inject } from '../model-layer/core/modules/decorators';
import { Random } from '../util/helper';
import { Logger } from './logger';
import { Config } from '../util/config';

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

  private readonly f2l = new Fido2Lib({
    challengeSize: 128,
    attestation: 'direct',
    cryptoParams: [-7],
    authenticatorAttachment: 'cross-platform',
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: 'discouraged',
    rpName: 'http://localhost:8000'
  });

  private readonly pendingRegister: { [key: string]: string } = {};

  public constructor() {}

  public async createOptions(): Promise<any> {
    return await this.f2l.attestationOptions();
  }

  public createOptionsInstantly(args: { userId?: string; username: string }): any {
    return {
      challenge: this.createChallenge(),
      rp: {
        name: 'http://localhost:8000'
      },
      user: {
        id: args.userId || Buffer.from(Uint8Array.from(Random.cryptoKey(8), c => c.charCodeAt(0))).toString('base64'),
        name: args.username,
        displayName: args.username
      },
      extensions: {
        txAuthSimple: ''
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        requiredResidentKey: false,
        authenticatorAttachment: 'cross-platform',
        userVerification: 'discouraged'
      },
      timeout: 60000,
      attestation: 'direct'
    };
  }

  public async register(username: string, userId?: string): Promise<any> {
    return new Promise(async resolve => {
      const publicKeyCredentialCreationOptions = await this.createOptions();
      const id = userId || Random.id();
      publicKeyCredentialCreationOptions.user = {
        id: Base64.encode(id),
        name: username,
        displayName: username
      };
      this.pendingRegister[id] = publicKeyCredentialCreationOptions.challenge;
      publicKeyCredentialCreationOptions.challenge = Buffer.from(publicKeyCredentialCreationOptions.challenge).toString(
        'base64'
      );
      const subscription = this.websocket
        .broadcastAll<any>({
          event: 'fido-register',
          data: {
            event: FidoAuthenticationStep.CHALLENGE,
            content: { publicKeyCredentialCreationOptions, userId: id }
          }
        })
        .subscribe(message => {
          resolve(this.onChallenge(message.socketId, message.data));
          subscription.unsubscribe();
        });
    });
  }

  private onChallenge(socketId: string, request: FidoAuthentication): any {
    if (!request.content || !request.content.credential) {
      Logger.warn('No credentials provided!\n\rRETURN!');
      return;
    }
    return this.validateAttestation(request.content.credential, request.content.userId);
  }

  private async validateAttestation(receivedResult: any, userId: any): Promise<any> {
    receivedResult.id = receivedResult.id;
    receivedResult.rawId = Uint8Array.from(receivedResult.rawId, (c: any) => c.charCodeAt(0)).buffer;

    const expectedResult: any = {
      challenge: this.pendingRegister[userId],
      origin: Config.isProductionMode() ? 'http://localhost:8000' : 'http://localhost:4200',
      factor: 'either'
    };
    const result = await this.f2l.attestationResult(receivedResult, expectedResult);
    return {
      publicKeyPem: result.authnrData.get('credentialPublicKeyPem'),
      counter: result.authnrData.get('counter'),
      credentialId: Buffer.from(result.authnrData.get('credId'))
    };
  }

  private createChallenge(): string {
    return Buffer.from(Uint8Array.from(Random.cryptoKey(), c => c.charCodeAt(0))).toString('base64');
  }
}

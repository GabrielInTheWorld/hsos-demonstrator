import { CredentialLikeLogin, FidoService } from 'custom-fido-library';

import { Config } from '../../config';
import { Logger } from '../../../services/logger';
import { User } from '../../../model-layer/core/models/user';

export class Fido {
  private static readonly localClientUrl = 'http://localhost:4200';
  private static readonly localServerUrl = 'http://localhost:8000';

  private static readonly pendingUsers: { [key: string]: any } = {};

  public static getLoginOptions(user: User): any {
    if (!user.fido) {
      throw new Error('Not fido registered');
    }
    const publicKeyCredentialRequestOptions = FidoService.getLoginOptions(user.fido?.credentialId);
    this.pendingUsers[user.userId] = publicKeyCredentialRequestOptions.challenge;
    return publicKeyCredentialRequestOptions;
  }

  public static isSignatureValid(user: User, credential: CredentialLikeLogin): boolean {
    if (!user.fido || !user.fido.publicKeyPem) {
      return false;
    }
    try {
      const expectations = {
        challenge: this.pendingUsers[user.userId],
        counter: user.fido.counter,
        publicKeyPem: user.fido.publicKeyPem,
        origin: Config.isProductionMode() ? this.localServerUrl : this.localClientUrl
      };
      FidoService.verifySignature(credential, expectations);
      return true;
    } catch (e) {
      Logger.debug('Something went wrong:', e);
      return false;
    }
  }
}

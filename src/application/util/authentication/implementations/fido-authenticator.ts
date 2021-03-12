import { AuthenticatorValidationResult } from '../interfaces/authenticator';
import { BaseAuthenticator } from './base-authenticator';
import { Inject } from '../../../model-layer/core/modules/decorators';
import { FidoProviderService } from '../../../services/fido-provider-service';
import { Fido } from '../services/fido-service';
import { User } from '../../../model-layer/core/models/user';
import { Logger } from '../../../services/logger';

export class FidoAuthenticator extends BaseAuthenticator {
  @Inject(FidoProviderService)
  private readonly fidoProviderServer: FidoProviderService;

  public async isAuthenticationTypeMissing(user: User, value?: any): Promise<AuthenticatorValidationResult> {
    if (!value) {
      const additionalData = Fido.getLoginOptions(user);
      Logger.log(`Sende Challenge "${additionalData.challenge}" an Client.`);
      return { missing: true, additionalData };
    } else {
      return { missing: !Fido.isSignatureValid(user, value) };
    }
  }

  public async prepareAuthenticationType(user: User, value?: any): Promise<User> {
    user.fido = await this.fidoProviderServer.register(user.username, user.userId, value);
    return user;
  }
}

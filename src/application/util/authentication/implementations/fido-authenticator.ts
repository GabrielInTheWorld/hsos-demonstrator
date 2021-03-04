import { User } from '../../../model-layer/core/models/user';
import { FidoProviderService } from '../../../services/fido-provider-service';
import { Inject } from '../../../model-layer/core/modules/decorators';
import { BaseAuthenticator } from './base-authenticator';
import { Fido } from '../services/fido-service';
import { AuthenticatorValidationResult } from '../interfaces/authenticator';

export class FidoAuthenticator extends BaseAuthenticator {
  @Inject(FidoProviderService)
  private readonly fidoProviderServer: FidoProviderService;

  public async isAuthenticationTypeMissing(user: User, value?: any): Promise<AuthenticatorValidationResult> {
    if (!value) {
      return { missing: true, additionalData: await Fido.getLoginOptionsLib(user) };
    } else {
      return { missing: !(await Fido.isSignatureValidLib(user, value)) };
    }
  }

  public async prepareAuthenticationType(user: User, value?: any): Promise<User> {
    user.fido = await this.fidoProviderServer.register(user.username, user.userId);
    return user;
  }
}

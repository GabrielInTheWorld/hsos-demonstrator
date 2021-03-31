import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Logger } from 'src/app/core/utils/logger';

import { FidoDialogComponent } from '../components/fido-dialog/fido-dialog.component';
import { SocketService } from './../../../../core/services/socket.service';
import { UsersService } from './users.service';

enum FidoAuthenticationStep {
    /**
     * First, request a server.
     */
    REQUEST = 'request',
    /**
     * Received a challenge from server.
     */
    CHALLENGE = 'challenge',
    /**
     * Second, provide a credential to that server.
     */
    CREDENTIAL = 'credential'
}

interface CredentialLike {
    id: string;
    rawId: string;
    response: {
        attestationObject: string;
        clientDataJSON: string;
    };
    type: string;
}

interface FidoAuthentication {
    event: FidoAuthenticationStep;
    content?: any;
}

@Injectable({
    providedIn: 'root'
})
export class FidoAuthenticatorService {
    public constructor(
        private readonly socket: SocketService,
        private readonly dialog: MatDialog,
        private readonly snackbar: MatSnackBar,
        private readonly userService: UsersService
    ) {
        this.socket.fromEvent('create-user').subscribe((answer: any) => {
            console.log('create-user event:', answer);
            this.onRegister(answer);
        });
    }

    public async login(credentialOptions: any): Promise<any> {
        let result = null;
        try {
            result = await this.onLogin(credentialOptions);
        } catch (e) {
            result = null;
        }
        this.dialog.closeAll();
        return result;
    }

    private async onLogin(credentialOptions: any): Promise<any> {
        const fromHexString = (hexString: string) =>
            new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        Logger.next('FIDO: Erhaltene Challenge', credentialOptions.challenge);
        credentialOptions.challenge = this.base64ToBuffer(credentialOptions.challenge);
        for (const allowCredentials of credentialOptions.allowCredentials) {
            allowCredentials.id = fromHexString(atob(allowCredentials.id));
        }
        this.dialog.open(FidoDialogComponent, {
            data: { title: 'Authentifizierungsprozess', content: 'Bitte tippen Sie jetzt auf Ihr FIDO2-Token' }
        });
        Logger.next('FIDO: Benutzerinteraktion ist erforderlich.');
        const credentials: any = await navigator.credentials.get({ publicKey: credentialOptions });
        return {
            id: credentials.id,
            rawId: this.toString(credentials.rawId),
            response: {
                authenticatorData: this.toString(credentials.response.authenticatorData),
                clientDataJSON: this.toString(credentials.response.clientDataJSON),
                signature: this.toString(credentials.response.signature),
                userHandle: this.toString(credentials.response.userHandle)
            },
            type: credentials.type
        };
    }

    private async onRegister(answer: any): Promise<void> {
        if (answer.fido) {
            await this.challengeCredential(answer.fido);
        }
    }

    private async challengeCredential(answer: any): Promise<void> {
        console.log('challengeCredential', answer);
        let content: any = null;
        try {
            const credential = await this.onAnswerFromServer(answer);
            content = { credential, userId: answer.userId };
        } catch (e) {
            console.log('Something went wrong:', e);
            this.snackbar.open('Ihr Gerät ist dafür nicht ausgelegt.', 'Okay', { duration: 2000 });
            content = 'cancel';
        }
        this.dialog.closeAll();
        await this.userService.updateCurrentUserToCreate({ fido: content.credential, userId: answer.user.id });
    }

    private async onAnswerFromServer(answer: any): Promise<Credential> {
        const publicKeyCredentialCreationOptions = this.extractPublicKeyCredentialCreationOptions(answer);
        Logger.next('FIDO: Erhaltene Challenge', publicKeyCredentialCreationOptions.challenge);
        this.dialog.open(FidoDialogComponent, {
            data: { title: 'Registrierungsprozess', content: 'Bitte tippen Sie jetzt auf Ihr FIDO2-Token' }
        });
        Logger.next('FIDO: Benutzerinteraktion ist erforderlich.');
        const credential = (await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        })) as any;
        const credentialLike: CredentialLike = {
            id: credential.id,
            rawId: this.toString(credential.rawId),
            response: {
                attestationObject: this.toString(credential.response.attestationObject),
                clientDataJSON: this.toString(credential.response.clientDataJSON)
            },
            type: credential.type
        };
        return credentialLike;
    }

    private extractPublicKeyCredentialCreationOptions(answer: any): any {
        const publicKeyCredentialCreationOptions = JSON.parse(JSON.stringify(answer));
        publicKeyCredentialCreationOptions.challenge = atob(publicKeyCredentialCreationOptions.challenge);
        publicKeyCredentialCreationOptions.user.id = atob(publicKeyCredentialCreationOptions.user.id);
        publicKeyCredentialCreationOptions.challenge = Uint8Array.from(
            publicKeyCredentialCreationOptions.challenge,
            (c: string) => c.charCodeAt(0)
        );
        publicKeyCredentialCreationOptions.user.id = Uint8Array.from(
            publicKeyCredentialCreationOptions.user.id,
            (c: string) => c.charCodeAt(0)
        );
        return publicKeyCredentialCreationOptions;
    }

    private toString(buffer: ArrayBuffer): string {
        const encoded = String.fromCharCode.apply(null, new Uint8Array(buffer));
        return btoa(encoded);
    }

    private base64ToBuffer(base64: string): Uint8Array {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }
}

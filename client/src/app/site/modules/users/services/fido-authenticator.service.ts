import { Injectable } from '@angular/core';

import { CryptoService } from './../../../../core/services/crypto.service';
import { SocketService } from './../../../../core/services/socket.service';
import { HttpService } from 'src/app/core/services/http.service';

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
        private readonly crypto: CryptoService,
        private http: HttpService
    ) {
        this.socket
            .fromEvent('fido-register')
            // .emit<FidoAuthentication, FidoAuthentication>('fido-register', {
            //     event: FidoAuthenticationStep.REQUEST,
            //     content: { username, userId }
            // })
            .subscribe((answer: any) => {
                console.log('answer from server', answer);
                this.onRegister(answer);
            });
    }

    public register(username: string, userId?: string): void {
        // this.http.get('make-credential').then(async (answer: any) => {
        //     console.log('answer from http:', answer);

        //     if (answer.success) {
        //         delete answer.success;
        //     }
        //     if (answer.message) {
        //         delete answer.message;
        //     }
        //     answer.challenge = Uint8Array.from(answer.challenge, (c: string) => c.charCodeAt(0));
        //     answer.user.id = Uint8Array.from(answer.user.id, (c: string) => c.charCodeAt(0));
        //     const credential = await navigator.credentials.create({ publicKey: answer });
        //     this.http.post('make-credential', credential).then(created => console.log('after posting:', created));
        // });
        this.socket
            .emit<FidoAuthentication, FidoAuthentication>('fido-register', {
                event: FidoAuthenticationStep.REQUEST,
                content: { username, userId }
            })
            .subscribe(answer => {
                console.log('answer from server', answer);
                this.onRegister(answer, username);
            });
    }

    public async login(credentialOptions: any): Promise<any> {
        const fromHexString = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        credentialOptions.challenge = this.base64ToBuffer(credentialOptions.challenge);
        // credentialOptions.challenge = Uint8Array.from(atob(credentialOptions.challenge), (c) => c.charCodeAt(0));
        for (const allowCredentials of credentialOptions.allowCredentials) {
            allowCredentials.id = fromHexString(atob(allowCredentials.id));
            // allowCredentials.id = this.base64ToBuffer(allowCredentials.id);
        }
        console.log('login procedure', credentialOptions);
        const credentials: any = await navigator.credentials.get({ publicKey: credentialOptions });
        console.log('credentials from get', credentials);
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

    private async onRegister(answer: FidoAuthentication, username?: string): Promise<void> {
        switch (answer.event) {
            case FidoAuthenticationStep.CHALLENGE:
                const credential = await this.onAnswerFromServer(
                    answer.content.publicKeyCredentialCreationOptions,
                    username,
                    pubCredential => {
                        // console.log('pubCredential', pubCredential);
                        // this.http.post('fido-register', pubCredential);
                        // this.socket.emit('fido-register', {
                        //     event: FidoAuthenticationStep.CREDENTIAL,
                        //     content: { credential: pubCredential }
                        // });
                    }
                );
                // console.log('sending the following credential to server:', credential);
                // this.http.post('fido-register', { credential });
                this.socket.emit('fido-register', {
                    event: FidoAuthenticationStep.CREDENTIAL,
                    content: { credential, userId: answer.content.userId }
                });
                break;
        }
    }

    private async onAnswerFromServer(
        answer: any,
        username?: string,
        callback?: (credential: any) => void
    ): Promise<Credential> {
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
        console.log('onAnswerFromServer:', publicKeyCredentialCreationOptions);
        // const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        //     challenge: Uint8Array.from(answer, c => c.charCodeAt(0)),
        //     rp: {
        //         name: 'Demonstrator',
        //     },
        //     user: {
        //         id: Uint8Array.from(this.crypto.generateRandomString(8), c => c.charCodeAt(0)),
        //         name: username,
        //         displayName: username
        //     },
        //     pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        //     authenticatorSelection: {
        //         authenticatorAttachment: 'cross-platform',
        //         userVerification: 'discouraged'
        //     },
        //     timeout: 60000,
        //     attestation: 'direct'
        // };
        const credential = (await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        })) as any;
        console.log('created credentials', credential);
        // const copiedCredential = JSON.parse(JSON.stringify(credential));
        // console.log('copied credential:', JSON.stringify(credential));
        const credentialLike: CredentialLike = {
            id: credential.id,
            rawId: this.toString(credential.rawId),
            response: {
                attestationObject: this.toString(credential.response.attestationObject),
                clientDataJSON: this.toString(credential.response.clientDataJSON)
            },
            type: credential.type
        };
        // const view = new Uint8Array(credential.response.attestationObject);
        // let result = '';
        // for (let i = 0; i < view.length; ++i) {
        //     result = result.concat(view[i].toString(), ' ');
        // }
        // console.log('attestationObject:\n\r', cbor.decode(credential.response.attestationObject));
        console.log('attestationObject:\n\r', this.toHex(credential.response.attestationObject));
        console.log('attestationObject:\n\r', credentialLike.response.attestationObject);
        // callback(credentialLike);
        return credentialLike;
    }

    private toString(buffer: ArrayBuffer): string {
        const encoded = String.fromCharCode.apply(null, new Uint8Array(buffer));
        // console.log('buffer', encoded, btoa(encoded));
        return btoa(encoded);
    }

    private toHex(buffer: ArrayBuffer): string {
        return Array.from(new Uint8Array(buffer), byte => {
            return ('0' + (byte & 0xff).toString(16)).slice(-2);
        }).join(' ');
    }

    private base64ToBuffer(base64: string): Uint8Array {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    }
}

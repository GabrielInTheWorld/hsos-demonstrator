import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class TwoFactorAuthService {
    // public get authValues(): {key: string, value: string}[] {
    //     [{key: 'password', }]
    // }

    public readonly authOptionsAsArray = [
        { key: 'password', value: 'Passwort' },
        { key: 'totp', value: 'QR-Code' },
        { key: 'email', value: 'E-Mail' }
    ];
    // public readonly authOptions = [{ password: 'Passwort' }, { totp: 'QR-Code' }, { email: 'E-Mail' }];
    public readonly authOptions = { password: 'Passwort', totp: 'QR-Code', email: 'E-Mail' };

    public constructor(private readonly http: HttpService) {}

    public async getAuthenticationMethods(): Promise<any> {
        const methods = await this.http.post('/api/settings/get-authentication');
        console.log('methods', methods);
        return methods;
    }

    public async confirmNextAuthenticationMethods(authenticationTypes: any): Promise<string> {
        const answer = await this.http.post<any>('api/settings/set-authentication', {
            authenticationTypes,
            values: {}
        });
        console.log('answer', answer);
        const totpUri = answer.totpUri;
        return totpUri;
    }
}

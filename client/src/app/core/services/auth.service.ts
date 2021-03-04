import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthTokenService } from './auth-token.service';
import { HttpService, Answer } from './http.service';

interface LoginAnswer extends Answer {
    token: string;
}

export namespace Authentication {
    export type Digits = 6 | 7 | 8;

    export interface OtpValues {
        type: 'hotp' | 'totp';
        secret: string; // base32
        digits?: Digits;
        issuer: string;
        to: string;
        period?: number;
        initialCounter?: number;
    }

    export function otpToUri(options: OtpValues): string {
        let uri = `otpauth://${options.type}/${options.issuer}:${options.to}?secret=${options.secret}&issuer=${options.issuer}`;
        if (options.digits) {
            uri += `&digits=${options.digits || 6}`;
        }
        if (options.period) {
            uri += `&period=${options.period || 30}`;
        }
        if (options.initialCounter) {
            uri += `&counter=${options.initialCounter}`;
        }
        return uri;
    }
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public get InitiateObservable(): Observable<boolean> {
        return this.initiateSubject.asObservable();
    }

    private readonly initiateSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public constructor(
        private readonly http: HttpService,
        private readonly authTokenService: AuthTokenService,
        private readonly router: Router
    ) {
        this.whoAmI(() => {
            this.initiateSubject.next(true);
            this.initiateSubject.complete();
        });
    }

    public sayHello(): Promise<void> {
        return this.http.get('/api/hello');
    }

    public async login(credentials: { username: string }): Promise<any> {
        const answer = await this.http.post<LoginAnswer>('/login', credentials);
        if (answer.success) {
            this.router.navigate(['']);
        } else {
            return answer;
        }
    }

    public async confirmAuthentication(
        username: string,
        additional: { password?: string; totp?: string; email?: string }
    ): Promise<any> {
        const answer = await this.http.post<LoginAnswer>('/confirm-login', { username, ...additional });
        if (answer.success) {
            this.router.navigate(['']);
        } else {
            return answer;
        }
    }

    public async interceptInitiating(): Promise<boolean> {
        if (this.initiateSubject.value === true) {
            return true;
        } else {
            return this.initiateSubject.toPromise();
        }
    }

    public async whoAmI(callback?: () => void): Promise<void> {
        await this.http.post<LoginAnswer>('/who-am-i');
        if (callback) {
            callback();
        }
    }

    public async logout(): Promise<void> {
        this.http
            .post('api/logout')
            .then(answer => {
                if (answer && answer.success) {
                    this.authTokenService.setRawAccessToken(null);
                }
            })
            .then(() => this.router.navigate(['sign-in']));
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.accessToken;
    }
}

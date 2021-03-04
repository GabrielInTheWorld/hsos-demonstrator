import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as url from 'url';

import { CryptoService } from './crypto.service';
import { HttpService, Answer } from './http.service';
import { StorageService } from './storage.service';

interface Server {
    authorizePath: string;
    tokenPath: string;
}

interface Client {
    clientId: string;
    clientSecret?: string;
    state: string;
    scope: string;
    redirectUris: string[];
    server: Server;
    accessToken?: string;
    refreshToken?: string;
}

export interface TokenType {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    tokenProvider?: string;
}

export interface UrlOptions {
    response_type?: string;
    scope?: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    code?: string;
    client_secret?: string;
}

export enum ClientProvider {
    GITHUB = 'github',
    OPENSLIDES = 'openslides',
    CUSTOM = 'custom'
}

@Injectable({
    providedIn: 'root'
})
export class OauthService {
    public static readonly devOAuthServer = 'http://localhost:8010';
    public static readonly prodOAuthServer = 'https://oauth-authorization.herokuapp.com';

    public get TokenTypeObservable(): Observable<TokenType> {
        return this.tokenSubject.asObservable();
    }

    public get openslidesOAuthUrl(): string {
        return this.buildURL(this.openslidesServer.authorizePath, this.getOptionsForAuthorizing(this.openslidesClient));
    }

    private readonly tokenSubject: BehaviorSubject<TokenType> = new BehaviorSubject(null);

    private oauthToken: string;

    private readonly providerStorageKey = 'provider';
    private readonly pkceStateStorageKey = 'pkceState';
    private readonly pkceCodeVerifierStorageKey = 'pkceCodeVerifier';

    private readonly openslidesServer = {
        authorizePath: `${OauthService.getOAuthServerURL()}/authorize`,
        tokenPath: `${OauthService.getOAuthServerURL()}/token`
    };

    private readonly openslidesClient: Client = {
        clientId: 'oauth-client-1',
        redirectUris: [`${this.getOAuthCallback()}`],
        scope: 'user',
        state: 'openslides',
        server: this.openslidesServer
    };

    public constructor(
        private readonly storage: StorageService,
        private readonly http: HttpService,
        private readonly crypto: CryptoService
    ) {}

    public static getOAuthServerURL(): string {
        const port = window.location.port;
        return port === '4200' ? OauthService.devOAuthServer : OauthService.prodOAuthServer;
    }

    public helloApi(): Promise<void> {
        return this.http.get(
            '/oauth/greet',
            { token: JSON.stringify({ authorization: this.oauthToken }), hello: 'world' },
            null,
            null,
            OauthService.getOAuthServerURL()
        );
    }

    public helloOAuth(): Promise<Answer> {
        return this.http.get(
            '/oauth/greet',
            null,
            new HttpHeaders().set('authorization', this.tokenSubject.value.accessToken),
            null,
            OauthService.getOAuthServerURL()
        );
    }

    public async oAuth2(provider: ClientProvider): Promise<void> {
        const client = this.getClientByProvider(provider);
        const state = this.crypto.generateRandomString();
        const codeVerifier = this.crypto.generateRandomString();
        await this.storage.set(this.pkceStateStorageKey, state);
        await this.storage.set(this.pkceCodeVerifierStorageKey, codeVerifier);
        await this.storage.set(this.providerStorageKey, provider);

        const codeChallenge = this.crypto.sha(codeVerifier);

        const authUrl = `${client.server.authorizePath}?response_type=code&client_id=${encodeURIComponent(
            client.clientId
        )}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(
            client.scope
        )}&redirect_uri=${encodeURIComponent(client.redirectUris[0])}&code_challenge=${encodeURIComponent(
            codeChallenge
        )}&code_challenge_method=S256`;

        window.location.href = authUrl;
    }

    public async oAuth2Callback(code: string, state: string, userId: string): Promise<void> {
        const provider = await this.storage.get<ClientProvider>(this.providerStorageKey);
        const storedState = await this.storage.get<string>(this.pkceStateStorageKey);
        const storedCodeVerifier = await this.storage.get(this.pkceCodeVerifierStorageKey);
        const client = this.getClientByProvider(provider);

        console.log('storedState', storedState, state, state.substr(state.indexOf('state')));

        if (storedState !== state) {
            return;
        }
        window.history.replaceState({}, null, '/');
        this.http
            .post<{ token_type: string; access_token: string; refresh_token?: string; token_provider?: string }>(
                '/token',
                {
                    grant_type: 'authorization_code',
                    code,
                    user_id: userId,
                    client_id: client.clientId,
                    redirect_uri: client.redirectUris[0],
                    code_verifier: storedCodeVerifier
                },
                null,
                OauthService.getOAuthServerURL()
            )
            .then(answer => {
                console.log('answer from token-endpoint', answer);
                this.oauthToken = answer.access_token;
                this.tokenSubject.next({
                    accessToken: answer.access_token,
                    refreshToken: answer.refresh_token,
                    tokenType: answer.token_type,
                    tokenProvider: answer.token_provider
                });
            });
    }

    public getAccessToken(code: string, state: string, provider: ClientProvider): any {
        const client = this.getClientByProvider(provider);
        console.log('get auth-token', code, state, client);
        return this.http
            .post(this.buildURL(client.server.tokenPath, this.getOptionsForToken(client, code)))
            .then(answer => console.log('answer from accesstoken', answer));
    }

    private buildURL(path: string, options: UrlOptions, hash?: string): string {
        const newUrl = url.parse(path, true);
        delete newUrl.search;
        if (!newUrl.query) {
            newUrl.query = {};
        }
        for (const key in options) {
            newUrl.query[key] = (options as any)[key];
        }
        if (hash) {
            newUrl.hash = hash;
        }
        return url.format(newUrl);
    }

    private getOptionsForAuthorizing(clientObject: Client): UrlOptions {
        return {
            client_id: clientObject.clientId,
            scope: clientObject.scope,
            redirect_uri: clientObject.redirectUris[0],
            state: clientObject.state,
            response_type: 'code'
        };
    }

    private getOptionsForToken(client: Client, authCode: string): UrlOptions {
        return {
            client_id: client.clientId,
            client_secret: client.clientSecret,
            redirect_uri: client.redirectUris[0],
            state: client.state,
            code: authCode
        };
    }

    private getClientByProvider(provider: ClientProvider): Client {
        switch (provider) {
            default:
                return this.openslidesClient;
        }
    }

    private getOAuthCallback(): string {
        const protocol = window.location.protocol;
        const location = window.location.hostname;
        const port = window.location.port;
        return `${protocol}//${location}:${port === '4200' ? '4200/callback' : `${port}/callback`}`;
    }
}

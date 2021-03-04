import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { OauthService, TokenType } from 'src/app/core/services/oauth.service';

@Injectable({
    providedIn: 'root'
})
export class OauthMotionsService {
    private readonly oauthRoute = 'oauth/motions';

    private token: TokenType = null;

    public constructor(private readonly http: HttpService, private readonly oauth: OauthService) {
        oauth.TokenTypeObservable.subscribe(token => (this.token = token));
    }

    public async getAll(): Promise<any> {
        return this.http.get(
            `${this.oauthRoute}/all`,
            null,
            new HttpHeaders().set('authorization', this.token.accessToken),
            null,
            OauthService.getOAuthServerURL()
        );
    }

    public async get(id: string): Promise<any> {
        return this.http.post(
            `${this.oauthRoute}/get`,
            { id },
            new HttpHeaders().set('authorization', this.token.accessToken),
            OauthService.getOAuthServerURL()
        );
    }
}

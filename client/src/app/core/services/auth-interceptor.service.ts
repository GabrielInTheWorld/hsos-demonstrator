import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthTokenService } from './auth-token.service';

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
    public constructor(private readonly authTokenService: AuthTokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authTokenService.rawAccessToken) {
            request = request.clone({
                setHeaders: {
                    authentication: this.authTokenService.rawAccessToken
                }
            });
        }
        this.logHttpEvent(request);
        return next.handle(request).pipe(
            tap(
                httpEvent => this.handleHttpResponse(httpEvent),
                error => this.handleHttpError(error)
            )
        );
    }

    private handleHttpResponse(httpEvent: HttpEvent<any>): void {
        if (httpEvent instanceof HttpResponse) {
            this.logHttpEvent(httpEvent);
        }
        if (httpEvent instanceof HttpResponse && httpEvent.headers.get('Authentication')) {
            this.authTokenService.setRawAccessToken(httpEvent.headers.get('Authentication'));
        }
    }

    private handleHttpError(error: any): void {
        if (error instanceof HttpErrorResponse) {
            console.error(error);
        }
    }

    private logHttpEvent(httpEvent: HttpRequest<any> | HttpResponse<any>): void {
        const eventName = httpEvent instanceof HttpRequest ? 'New request' : 'Response';
        const segments = [
            `${eventName}:`,
            `Url: ${httpEvent.url}`,
            'Body:',
            httpEvent.body,
            'Headers:',
            this.convertHeadersToString(httpEvent.headers)
        ];
        if (httpEvent instanceof HttpResponse) {
            segments.splice(1, 0, `Status: ${httpEvent.status}`);
        }
        console.log(...segments);
    }

    private convertHeadersToString(headersToConvert: HttpHeaders): string {
        let headers = '';
        headersToConvert.keys().forEach(key => {
            headers += `${key}: ${headersToConvert.get(key)}\n`;
        });
        return headers;
    }
}

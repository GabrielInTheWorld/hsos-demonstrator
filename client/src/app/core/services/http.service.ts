import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Answer<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

export enum HTTPMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private readonly defaultHeaders: HttpHeaders;

    private readonly serverURL: string;

    public constructor(private readonly http: HttpClient) {
        this.defaultHeaders = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');
        this.serverURL = this.getServerURL();
    }

    /**
     * Send the a http request the the given path.
     * Optionally accepts a request body.
     *
     * @param path the target path, usually starting with /rest
     * @param method the required HTTP method (i.e get, post, put)
     * @param data optional, if sending a data body is required
     * @param customHeader optional custom HTTP header of required
     * @param responseType optional response type, default set to json (i.e 'arraybuffer')
     * @returns a promise containing a generic
     */
    private async send<T = Answer>(
        path: string,
        method: HTTPMethod,
        data?: any,
        customHeader?: HttpHeaders,
        responseType?: string,
        serverURL: string = this.serverURL
    ): Promise<T> {
        if (!responseType) {
            responseType = 'json';
        }

        const url = path.startsWith('/') ? `${serverURL}${path}` : `${serverURL}/${path}`;

        const options = {
            observe: 'response',
            body: data,
            headers: customHeader ? customHeader : this.defaultHeaders,
            withCredentials: true, // true for working with cookies
            responseType: responseType as 'json'
        };

        try {
            const response = await (this.http.request<T>(method, url, options as any) as Observable<
                HttpResponse<T>
            >).toPromise();
            return response.body;
        } catch (e) {
            console.log('Error while request', e);
            return e.error;
        }
    }

    /**
     * Executes a get on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param header optional HTTP header if required
     * @param responseType option expected response type by the request (i.e 'arraybuffer')
     * @returns A promise holding a generic
     */
    public async get<T = Answer>(
        path: string,
        data?: any,
        header?: HttpHeaders,
        responseType?: string,
        serverURL?: string
    ): Promise<T> {
        return await this.send<T>(path, HTTPMethod.GET, data, header, responseType, serverURL);
    }

    public async post<T = Answer>(path: string, data?: any, header?: HttpHeaders, serverURL?: string): Promise<T> {
        return await this.send<T>(path, HTTPMethod.POST, data, header, null, serverURL);
    }

    public async patch<T = Answer>(path: string, data?: any, header?: HttpHeaders, serverURL?: string): Promise<T> {
        return await this.send<T>(path, HTTPMethod.PATCH, data, header, null, serverURL);
    }

    public async put<T = Answer>(path: string, data?: any, header?: HttpHeaders, serverURL?: string): Promise<T> {
        return await this.send<T>(path, HTTPMethod.PUT, data, header, null, serverURL);
    }

    public async delete<T = Answer>(path: string, data?: any, header?: HttpHeaders, serverURL?: string): Promise<T> {
        return await this.send<T>(path, HTTPMethod.DELETE, data, header, null, serverURL);
    }

    private getServerURL(): string {
        const protocol = window.location.protocol;
        const location = window.location.hostname;
        const port = window.location.port;
        return `${protocol}//${location}:${location === 'localhost' ? '8000' : port}`;
    }
}

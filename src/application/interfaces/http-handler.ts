export enum HttpProtocol {
  HTTPS = 'https',
  HTTP = 'http'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE'
}

export interface HttpHeaders {
  [key: string]: string;
}

export abstract class HttpHandler {
  public abstract get(url: string, data?: any, headers?: HttpHeaders, responseType?: string): Promise<any>;
  public abstract post(url: string, data?: any, headers?: HttpHeaders): Promise<any>;
  public abstract delete(url: string, data?: any, headers?: HttpHeaders): Promise<any>;
}

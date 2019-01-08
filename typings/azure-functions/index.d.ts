declare module 'azure-functions' {
  import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

  export interface HttpRequest {
    body: any;
    headers: IncomingHttpHeaders;
    method: string;
    originalUrl: string;
    params: { [key: string]: any };
    query: { [key: string]: any };
    rawBody: string;
  }

  export interface HttpResponse {
    body?: any;
    headers?: OutgoingHttpHeaders;
    isRaw?: boolean;
    status?: number;
  }

  interface Logger {
    (...message: any): void;
    error(...message: any): void;
    warn(...message: any): void;
    info(...message: any): void;
    verbose(...message: any): void;
    metric(...message: any): void;
  }

  export interface Context {
    bindings: any;
    req: HttpRequest;
    bindingData: any;
    res: HttpResponse;
    log: Logger;
    done(err?: Error | null, propertyBag?: { [key: string]: any }): void;
  }
}

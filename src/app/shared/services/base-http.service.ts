import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpRequest} from "@angular/common/http";
import {catchError, Observable, of, throwError} from "rxjs";
import {LoggerService} from "./logger.service";
import {Store} from "../../../store";

export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: "body";
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
  body?: any;
  operation?: string;
  failWith?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private store: Store,
  ) {
  }

  public get<T>(url: string, options: IRequestOptions = {}): Observable<T> {
    const headers: HttpHeaders = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer " + this.store.value.access_token
    });
    options.headers = headers;
    return this.http.get<T>(url, options).pipe(
      catchError(this.handleError<T>(options.operation || ("GET " + url), options.failWith ? options.failWith : null)),
    );
  }

  public post<T>(url: string, payload: object, options: IRequestOptions = {}): Observable<T> {
    return this.http.post<T>(url, payload, options).pipe(
      catchError(this.handleError<T>(options.operation || ("POST " + url), options.failWith ? options.failWith : null)),
    );
  }

  public put<T>(url: string, payload: object, options: IRequestOptions = {}): Observable<T> {
    return this.http.put<T>(url, payload, options).pipe(
      catchError(this.handleError<T>(options.operation || ("PUT " + url), options.failWith ? options.failWith : null)),
    );
  }

  public delete<T>(url: string, options: IRequestOptions = {}): Observable<T> {
    return this.http.delete<T>(url, options).pipe(
      catchError(this.handleError<T>(options.operation || ("DELETE " + url), options.failWith ? options.failWith : null)),
    );
  }

  public upload<T>(req: HttpRequest<T>, options: IRequestOptions = {}) {
    return this.http.request<T>(req).pipe(
      catchError(this.handleError(options.operation || ("UPLOAD " + req.url), options.failWith ? options.failWith : null)),
    );
  }

  private handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      this.logger.error(error);
      this.logger.log((`${operation} failed: ${error.message}`));
      return result ? of(result) : throwError(error);
    };
  }
}

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Constants } from '../models/constants';
import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] != null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    return this.http
      .get<Response<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message);
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http
      .post<Response<T>>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe(
        map(response => {
          if (!response.status) {
            throw new Error(response.message);
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<Response<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      map(response => {
        if (!response.status) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<Response<T>>(`${this.baseUrl}/${endpoint}`).pipe(
      map(response => {
        if (!response.status) {
          console.log(response.message);
          throw new Error(response.message);
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const { error: knowError } = error;
    if (knowError) {
      // return throwError(() => new Error(obtenerMensajeError(knowError.message)));
    }
    return throwError(() => new Error(Constants.ERROR_MESSAGE));
  }
}

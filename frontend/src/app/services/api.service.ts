import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Response } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getApiUrl(): string {
    return this.baseUrl;
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] != null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key] as string);
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
        })
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
        })
      );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<Response<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      map(response => {
        if (!response.status) {
          throw new Error(response.message);
        }
        return response.data;
      })
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<Response<T>>(`${this.baseUrl}/${endpoint}`).pipe(
      map(response => {
        if (!response.status) {
          console.error(response.message);
          throw new Error(response.message);
        }
        return response.data;
      })
    );
  }
}

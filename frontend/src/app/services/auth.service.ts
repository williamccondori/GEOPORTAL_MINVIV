import {inject, Injectable} from '@angular/core';

import {jwtDecode} from 'jwt-decode';
import {Observable} from 'rxjs';

import {AccessToken, Login} from '../models/login.model';

import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);

  login(login: Login): Observable<AccessToken> {
    const formData = new FormData();
    formData.append('username', login.username);
    formData.append('password', login.password);
    return this.apiService.post<AccessToken>('auth/', formData);
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return token !== null;
  }

  getUsername(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return 'No username';
    }
    const decodedToken: any = jwtDecode(token);
    return decodedToken.sub;
  }
}

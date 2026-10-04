import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Address, User } from '../../shared/models/user';
import { map, tap } from 'rxjs';
import { SignalrService } from './signalr.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private signalrService = inject(SignalrService);

  currentUser = signal<User | null>(null);

  login(values: any) {
    let params = new HttpParams();
    params = params.append('useCookies', true);
    return this.http.post<User>(this.baseUrl + 'login', values, { params });
  }

  register(values: any) {
    return this.http.post(this.baseUrl + 'account/register', values);
  }

  getUserInfo() {
    return this.http.get<User>(this.baseUrl + 'account/user-info', {observe: 'response'}).pipe(
      map((response: HttpResponse<User>) => {
        if (response.status === 200 && response.body) {
          this.currentUser.set(response.body);
        }
        return response; 
      })
    );
  }

  logout() {
    // return this.http.post(this.baseUrl + 'logout', {}).subscribe(() => this.currentUser.set(null));
    return this.http.post(this.baseUrl + 'account/logout', {}).pipe(
      tap(() => this.signalrService.stopHubConnection())
    );
  }

  updateAddress(address: Address) {
    return this.http.post(this.baseUrl + 'account/address', address).pipe(
      tap(() => {
        this.currentUser.update((user) => {
          if (user) user.address = address;
          return user;
        });
      }),
    );
  }

  getAuthState() {
    return this.http.get<{ isAuthenticated: boolean }>(this.baseUrl + 'account/auth-status');
  }
}

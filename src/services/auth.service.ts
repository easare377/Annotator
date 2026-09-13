import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AppSettingsService } from './app-settings.service';

export interface AuthUser {
  pk: number;
  email: string;
  firstName: string;
  surname: string;
}
export interface SessionInfo { user: AuthUser | null; googleClientId: string; }
export type AuthMode = 'login' | 'signup';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);

  readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient, private appSettings: AppSettingsService) {}

  session(): Promise<SessionInfo> {
    return firstValueFrom(this.http.get<SessionInfo>('/api/auth/session'))
      .then(session => {
        if (session.user) {
          this.appSettings.beginUserSession(session.user.pk);
        } else {
          this.appSettings.endUserSession();
        }
        this.userSubject.next(session.user);
        return session;
      });
  }

  authenticate(mode: AuthMode, provider: 'email' | 'google', body: object): Promise<{ user: AuthUser }> {
    return firstValueFrom(this.http.post<{ user: AuthUser }>(`/api/${mode}/${provider}`, body))
      .then(response => {
        this.appSettings.beginUserSession(response.user.pk);
        this.userSubject.next(response.user);
        return response;
      });
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<{ loggedOut: boolean }>('/api/logout', {}));
    this.appSettings.endUserSession();
    this.userSubject.next(null);
  }
}

// Allow only known application destinations, including their query parameters.
export function safeReturnUrl(value: string | null): string {
  return value && /^\/(?:projects\/data(?:\/annotate)?)?(?:\?[^#]*)?(?:#.*)?$/.test(value)
    && !value.includes('\\') ? value : '/';
}

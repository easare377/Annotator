import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService, safeReturnUrl } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { AppSettingsService } from './app-settings.service';

describe('Authentication requests', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let appSettings: jasmine.SpyObj<AppSettingsService>;
  beforeEach(() => {
    appSettings = jasmine.createSpyObj<AppSettingsService>(
      'AppSettingsService',
      ['beginUserSession', 'endUserSession']
    );
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      {provide: AppSettingsService, useValue: appSettings}
    ] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); document.cookie = 'csrftoken=; Max-Age=0; path=/'; });
  it('bootstraps the browser session', async () => {
    const result = auth.session();
    const request = http.expectOne('/api/auth/session');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ user: null, googleClientId: '' });
    expect((await result).user).toBeNull();
    expect(appSettings.endUserSession).toHaveBeenCalledTimes(1);
  });
  it('sends the current CSRF cookie and credentials for all auth providers', async () => {
    for (const mode of ['login', 'signup'] as const) {
      for (const provider of ['email', 'google'] as const) {
        document.cookie = 'csrftoken=rotated-token; path=/';
        const body = provider === 'google' ? { credential: 'test' } : { email: 'person@example.com', password: 'secret' };
        const result = auth.authenticate(mode, provider, body);
        const request = http.expectOne(`/api/${mode}/${provider}`);
        expect(request.request.method).toBe('POST');
        expect(request.request.headers.get('X-CSRFToken')).toBe('rotated-token');
        expect(request.request.withCredentials).toBeTrue();
        expect(request.request.body).toEqual(body);
        request.flush({
          user: {pk: 1, email: 'person@example.com', firstName: 'Person', surname: 'Example'}
        });
        await result;
        expect(appSettings.beginUserSession).toHaveBeenCalledWith(1);
      }
    }
  });
  it('logs out through the protected API endpoint', async () => {
    document.cookie = 'csrftoken=logout-token; path=/';

    const result = auth.logout();
    const request = http.expectOne('/api/logout');

    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-CSRFToken')).toBe('logout-token');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({loggedOut: true});
    await result;
    expect(appSettings.endUserSession).toHaveBeenCalledTimes(1);
  });
  it('does not send cookies or CSRF tokens to external upload storage', () => {
    document.cookie = 'csrftoken=private-token; path=/';
    TestBed.inject(HttpClient).put('https://storage.example/upload', 'image').subscribe();
    const request = http.expectOne('https://storage.example/upload');
    expect(request.request.withCredentials).toBeFalse();
    expect(request.request.headers.has('X-CSRFToken')).toBeFalse();
    request.flush({});
  });
  it('includes CSRF for absolute same-origin signed upload URLs', () => {
    document.cookie = 'csrftoken=upload-token; path=/';
    TestBed.inject(HttpClient).post(window.location.origin + '/api/projects/data/upload-image/test?token=signature', new FormData()).subscribe();
    const request = http.expectOne('/api/projects/data/upload-image/test?token=signature');
    expect(request.request.headers.get('X-CSRFToken')).toBe('upload-token');
    request.flush({});
  });
  it('rejects external and authentication return URLs', () => {
    for (const url of ['//evil.example', 'https://evil.example', '/login', '/signup', '/\\evil.example']) expect(safeReturnUrl(url)).toBe('/');
    expect(safeReturnUrl('/projects/data/annotate?pid=1&imid=2')).toBe('/projects/data/annotate?pid=1&imid=2');
  });
});

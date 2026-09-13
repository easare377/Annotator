import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../../services/auth.service';
import { GoogleSignInService } from '../../services/google-sign-in.service';

describe('Authentication page', () => {
  const validSignup = {
    firstName: 'Person',
    surname: 'Example',
    email: 'person@example.com',
    password: 'suitable password',
    confirmationPassword: 'suitable password'
  };
  let fixture: ComponentFixture<SignUpComponent>;
  let component: SignUpComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;
  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['session', 'authenticate']);
    auth.session.and.resolveTo({ user: null, googleClientId: '' });
    auth.authenticate.and.resolveTo({
      user: {pk: 1, email: 'person@example.com', firstName: 'Person', surname: 'Example'}
    });
    await TestBed.configureTestingModule({
      declarations: [SignUpComponent], imports: [ReactiveFormsModule, RouterModule],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth },
        { provide: GoogleSignInService, useValue: jasmine.createSpyObj('Google', ['render', 'clear']) },
        { provide: ActivatedRoute, useValue: { data: of({ mode: 'signup' }), snapshot: { queryParamMap: { get: () => '/projects/data?pid=123' } } } }]
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });
  it('shows signup name and password-confirmation fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.name-row input').length).toBe(2);
    expect(element.querySelector('#auth-confirmation-password')).not.toBeNull();
  });
  it('shows errors and does not submit invalid fields', async () => {
    await component.onSubmit();
    fixture.detectChanges();
    expect(auth.authenticate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Enter your email address.');
  });
  it('does not submit when the password confirmation differs', async () => {
    component.form.setValue({ ...validSignup, confirmationPassword: 'different password' });
    await component.onSubmit();
    fixture.detectChanges();
    expect(auth.authenticate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Passwords do not match.');
  });
  it('submits email signup and returns to the intended application page', async () => {
    component.form.setValue(validSignup);
    await component.onSubmit();
    expect(auth.authenticate).toHaveBeenCalledWith('signup', 'email', validSignup);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/projects/data?pid=123');
  });
  it('preserves email and shows server errors without navigating', async () => {
    auth.authenticate.and.rejectWith(new HttpErrorResponse({ status: 409, error: { code: 'email_already_registered' } }));
    component.form.setValue(validSignup);
    await component.onSubmit();
    expect(component.error).toContain('already exists');
    expect(component.form.controls.email.value).toBe('person@example.com');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });
  it('blocks duplicate submissions while a request is pending', async () => {
    let finish!: (value: any) => void;
    auth.authenticate.and.returnValue(new Promise(resolve => finish = resolve));
    component.form.setValue(validSignup);
    const request = component.onSubmit();
    await component.onSubmit();
    expect(auth.authenticate).toHaveBeenCalledTimes(1);
    finish({
      user: {pk: 1, email: 'person@example.com', firstName: 'Person', surname: 'Example'}
    });
    await request;
  });
  it('routes a Google credential to the selected endpoint', async () => {
    await component.submitGoogle('test-credential');
    expect(auth.authenticate).toHaveBeenCalledWith('signup', 'google', { credential: 'test-credential' });
  });
});

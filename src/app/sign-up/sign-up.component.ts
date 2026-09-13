import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthMode, AuthService, safeReturnUrl } from '../../services/auth.service';
import { GoogleSignInService } from '../../services/google-sign-in.service';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const confirmation = control.get('confirmationPassword');
  if (!confirmation || confirmation.disabled) return null;
  return control.get('password')?.value === confirmation.value ? null : { passwordMismatch: true };
}

@Component({ selector: 'app-sign-up', templateUrl: './sign-up.component.html', styleUrl: './sign-up.component.css' })
export class SignUpComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton') googleButton!: ElementRef<HTMLElement>;
  @ViewChild('firstNameInput') firstNameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('surnameInput') surnameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmationPasswordInput') confirmationPasswordInput?: ElementRef<HTMLInputElement>;
  mode: AuthMode = 'login';
  returnUrl = '/';
  showPassword = false;
  submitting = false;
  ready = false;
  error = '';
  googleState: 'loading' | 'ready' | 'unavailable' = 'loading';
  private destroyed = false;
  private routeSubscription: Subscription;
  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(150)]],
    surname: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmationPassword: ['', Validators.required]
  }, { validators: matchingPasswords });
  constructor(private fb: FormBuilder, private auth: AuthService, private google: GoogleSignInService,
    private route: ActivatedRoute, private router: Router, private zone: NgZone) {
    this.routeSubscription = this.route.data.subscribe(data => {
      this.mode = data['mode'];
      this.returnUrl = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
      this.error = '';
      this.showPassword = false;
      this.form.controls.password.reset('');
      this.form.controls.password.setValidators(this.mode === 'signup' ? [Validators.required, Validators.minLength(8)] : [Validators.required]);
      this.form.controls.password.updateValueAndValidity();
      const signupControls = [this.form.controls.firstName, this.form.controls.surname, this.form.controls.confirmationPassword];
      signupControls.forEach(control => control.reset(''));
      if (this.mode === 'signup') {
        this.form.controls.firstName.setValidators([Validators.required, Validators.maxLength(150)]);
        this.form.controls.surname.setValidators([Validators.required, Validators.maxLength(150)]);
        this.form.controls.confirmationPassword.setValidators(Validators.required);
        signupControls.forEach(control => control.enable({ emitEvent: false }));
      } else {
        signupControls.forEach(control => {
          control.clearValidators();
          control.disable({ emitEvent: false });
        });
      }
      signupControls.forEach(control => control.updateValueAndValidity({ emitEvent: false }));
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }
  ngAfterViewInit(): void { void this.initialize(); }
  async initialize(): Promise<void> {
    this.error = '';
    this.ready = false;
    try {
      const session = await this.auth.session();
      if (this.destroyed) return;
      if (session.user) { await this.router.navigateByUrl(this.returnUrl); return; }
      this.ready = true;
      if (!session.googleClientId) { this.googleState = 'unavailable'; return; }
      try {
        await this.google.render(this.googleButton.nativeElement, session.googleClientId, credential => {
          this.zone.run(() => { if (!this.destroyed) void this.submitGoogle(credential); });
        });
        if (this.destroyed) { this.google.clear(); return; }
        this.googleState = 'ready';
      } catch { this.googleState = 'unavailable'; }
    } catch { this.error = 'We couldn’t connect. Check your connection and try again.'; this.googleState = 'unavailable'; }
  }
  invalid(field: 'firstName' | 'surname' | 'email' | 'password' | 'confirmationPassword'): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }
  passwordsDoNotMatch(): boolean {
    return this.form.controls.confirmationPassword.touched && this.form.hasError('passwordMismatch');
  }
  async onSubmit(): Promise<void> {
    if (this.submitting || !this.ready) return;
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    if (this.mode === 'signup') {
      this.form.controls.firstName.setValue(this.form.controls.firstName.value.trim());
      this.form.controls.surname.setValue(this.form.controls.surname.value.trim());
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      if (this.mode === 'signup' && this.form.controls.firstName.invalid) this.firstNameInput?.nativeElement.focus();
      else if (this.mode === 'signup' && this.form.controls.surname.invalid) this.surnameInput?.nativeElement.focus();
      else if (this.form.controls.email.invalid) this.emailInput.nativeElement.focus();
      else if (this.form.controls.password.invalid) this.passwordInput.nativeElement.focus();
      else this.confirmationPasswordInput?.nativeElement.focus();
      return;
    }
    const { firstName, surname, email, password, confirmationPassword } = this.form.getRawValue();
    const body = this.mode === 'signup'
      ? { firstName, surname, email, password, confirmationPassword }
      : { email, password };
    await this.authenticate('email', body);
  }
  async submitGoogle(credential: string): Promise<void> {
    if (!this.submitting && this.ready) await this.authenticate('google', { credential });
  }
  private async authenticate(provider: 'email' | 'google', body: object): Promise<void> {
    this.submitting = true;
    this.error = '';
    try {
      await this.auth.authenticate(this.mode, provider, body);
      if (!this.destroyed) await this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      if (!this.destroyed) this.error = this.errorMessage(error);
    } finally { this.submitting = false; }
  }
  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'Something went wrong. Please try again.';
    const messages: Record<string, string> = {
      invalid_credentials: 'The email or password is incorrect. Please try again.',
      invalid_first_name: 'Enter your first name.',
      invalid_surname: 'Enter your last name.',
      invalid_email: 'Enter a valid email address.',
      invalid_password: 'Use at least 8 characters. Avoid common passwords, all numbers, or a password similar to your email.',
      password_mismatch: 'Passwords do not match.',
      email_already_registered: 'An account with this email already exists. Log in to continue.',
      google_account_already_registered: 'This Google account is already registered. Log in to continue.',
      account_already_registered: 'This account is already registered. Log in to continue.',
      account_link_required: 'This email already has a password account. Please log in with your email and password.',
      google_account_not_registered: 'No account is linked to this Google account. Create an account first.',
      invalid_google_credential: 'Google sign-in couldn’t be verified. Please try again.',
      unverified_google_email: 'Please verify your Google email before continuing.',
      already_authenticated: 'You’re already logged in. Open your projects to continue.'
    };
    if (error.status === 403) return 'Your session could not be verified. Refresh this page and try again.';
    if (error.status === 0) return 'We couldn’t connect. Check your connection and try again.';
    if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
    return messages[error.error?.code] || 'We couldn’t complete your request. Please try again.';
  }
  ngOnDestroy(): void { this.destroyed = true; this.routeSubscription.unsubscribe(); this.google.clear(); }
}

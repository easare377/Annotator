import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {AuthService, AuthUser} from '../../services/auth.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrl: './user-dropdown.component.css'
})
export class UserDropdownComponent {
  @ViewChild('menuButton') private menuButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('firstMenuItem') private firstMenuItem?: ElementRef<HTMLAnchorElement>;

  readonly user$ = this.auth.user$;
  open = false;
  signingOut = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  displayName(user: AuthUser | null): string {
    if (!user) return '';
    const name = [user.firstName, user.surname]
      .map(part => part.trim())
      .filter(Boolean)
      .join(' ');
    return name || user.email;
  }

  initials(user: AuthUser | null): string {
    if (!user) return '?';
    const initials = [user.firstName, user.surname]
      .map(part => part.trim()[0])
      .filter(Boolean)
      .join('')
      .toUpperCase();
    return initials || user.email.trim()[0]?.toUpperCase() || '?';
  }

  toggleMenu(): void {
    if (this.signingOut) return;
    this.open = !this.open;
    this.error = '';
  }

  openFromKeyboard(event: Event): void {
    event.preventDefault();
    if (!this.open) {
      this.open = true;
      this.error = '';
      setTimeout(() => this.firstMenuItem?.nativeElement.focus());
    }
  }

  closeMenu(restoreFocus = false): void {
    if (this.signingOut) return;
    this.open = false;
    this.error = '';
    if (restoreFocus) this.menuButton.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closeMenu(true);
  }

  async signOut(): Promise<void> {
    if (this.signingOut) return;
    this.signingOut = true;
    this.error = '';
    try {
      await this.auth.logout();
      this.open = false;
      await this.router.navigateByUrl('/login');
    } catch {
      this.error = 'We couldn’t sign you out. Please try again.';
    } finally {
      this.signingOut = false;
    }
  }
}

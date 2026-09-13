import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, RouterModule} from '@angular/router';
import {of} from 'rxjs';

import {ClickOutsideDirective} from '../click-outside.directive';
import {AuthService} from '../../services/auth.service';
import {UserDropdownComponent} from './user-dropdown.component';

describe('UserDropdownComponent', () => {
  let fixture: ComponentFixture<UserDropdownComponent>;
  let component: UserDropdownComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['logout'],
      {user$: of({
        pk: 1,
        email: 'person@example.com',
        firstName: 'Person',
        surname: 'Example',
      })}
    );
    auth.logout.and.resolveTo();

    await TestBed.configureTestingModule({
      declarations: [UserDropdownComponent],
      imports: [ClickOutsideDirective, RouterModule.forRoot([])],
      providers: [{provide: AuthService, useValue: auth}],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(UserDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the authenticated identity and menu actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.user-trigger')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('person@example.com');
    expect(element.textContent).toContain('Person Example');
    expect(element.querySelector('.user-avatar')?.textContent).toContain('PE');
    expect(element.textContent).toContain('Account');
    expect(element.textContent).toContain('Sign out');
  });

  it('ends the session and returns to login', async () => {
    await component.signOut();

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('keeps the menu open with an error if logout fails', async () => {
    component.open = true;
    auth.logout.and.rejectWith(new Error('Network failure'));

    await component.signOut();

    expect(component.open).toBeTrue();
    expect(component.error).toContain('couldn’t sign you out');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

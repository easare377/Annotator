import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {of} from 'rxjs';

import {ClickOutsideDirective} from '../click-outside.directive';
import {AuthService} from '../../services/auth.service';
import {TopbarActionDirective} from './topbar-action.directive';
import {TopbarComponent} from './topbar.component';
import {UserDropdownComponent} from '../user-dropdown/user-dropdown.component';

@Component({
  template: `
    <app-topbar>
      <nav topbarBreadcrumbs aria-label="Breadcrumb">Projected breadcrumb</nav>
      <div topbarActions>
        <button topbarAction="primary" (click)="clicked = true">Projected action</button>
      </div>
    </app-topbar>
  `
})
class TopbarHostComponent {
  clicked = false;
}

describe('TopbarComponent', () => {
  let fixture: ComponentFixture<TopbarHostComponent>;

  beforeEach(async () => {
    const auth = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['logout'],
      {user$: of({
        pk: 1,
        email: 'person@example.com',
        firstName: 'Person',
        surname: 'Example',
      })}
    );
    await TestBed.configureTestingModule({
      declarations: [
        TopbarComponent,
        TopbarActionDirective,
        TopbarHostComponent,
        UserDropdownComponent,
      ],
      imports: [ClickOutsideDirective, RouterModule.forRoot([])],
      providers: [{provide: AuthService, useValue: auth}],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarHostComponent);
    fixture.detectChanges();
  });

  it('projects page breadcrumbs and functional page actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const action = element.querySelector<HTMLButtonElement>('.topbar-action-primary');

    expect(element.textContent).toContain('Projected breadcrumb');
    expect(action?.textContent).toContain('Projected action');
    action?.click();

    expect(fixture.componentInstance.clicked).toBeTrue();
  });
});

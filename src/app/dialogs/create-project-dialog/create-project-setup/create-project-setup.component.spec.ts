import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectSetupComponent } from './create-project-setup.component';

describe('CreateProjectSetupComponent', () => {
  let component: CreateProjectSetupComponent;
  let fixture: ComponentFixture<CreateProjectSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateProjectSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateProjectSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

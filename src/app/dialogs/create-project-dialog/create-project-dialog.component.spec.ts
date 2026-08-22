import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectDialogComponent } from './create-project-dialog.component';

describe('CreateProjectComponent', () => {
  let component: CreateProjectDialogComponent;
  let fixture: ComponentFixture<CreateProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateProjectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

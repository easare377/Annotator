import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignClassDialogComponent } from './assign-class-dialog.component';

describe('AssignClassDialogComponent', () => {
  let component: AssignClassDialogComponent;
  let fixture: ComponentFixture<AssignClassDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignClassDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignClassDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

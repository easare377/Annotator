import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLabelFormComponent } from './add-label-form.component';

describe('AddLabelFormComponent', () => {
  let component: AddLabelFormComponent;
  let fixture: ComponentFixture<AddLabelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLabelFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLabelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

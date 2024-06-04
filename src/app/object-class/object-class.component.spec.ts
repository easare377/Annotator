import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectClassComponent } from './object-class.component';

describe('ObjectClassComponent', () => {
  let component: ObjectClassComponent;
  let fixture: ComponentFixture<ObjectClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObjectClassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObjectClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

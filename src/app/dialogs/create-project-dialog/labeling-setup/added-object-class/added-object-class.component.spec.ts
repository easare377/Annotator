import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedObjectClassComponent } from './added-object-class.component';

describe('AddedObjectClassComponent', () => {
  let component: AddedObjectClassComponent;
  let fixture: ComponentFixture<AddedObjectClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddedObjectClassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddedObjectClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

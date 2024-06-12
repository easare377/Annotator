import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelSetupComponent } from './label-setup.component';

describe('LabelSetupComponent', () => {
  let component: LabelSetupComponent;
  let fixture: ComponentFixture<LabelSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabelSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

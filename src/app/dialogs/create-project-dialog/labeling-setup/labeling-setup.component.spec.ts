import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelingSetupComponent } from './labeling-setup.component';

describe('LabelingSetupComponent', () => {
  let component: LabelingSetupComponent;
  let fixture: ComponentFixture<LabelingSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelingSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabelingSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

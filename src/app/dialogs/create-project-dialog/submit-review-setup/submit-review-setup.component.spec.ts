import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitReviewSetupComponent } from './submit-review-setup.component';

describe('SubmitReviewSetupComponent', () => {
  let component: SubmitReviewSetupComponent;
  let fixture: ComponentFixture<SubmitReviewSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmitReviewSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitReviewSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

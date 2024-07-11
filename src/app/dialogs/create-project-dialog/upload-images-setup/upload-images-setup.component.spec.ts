import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImagesSetupComponent } from './upload-images-setup.component';

describe('UploadImagesSetupComponent', () => {
  let component: UploadImagesSetupComponent;
  let fixture: ComponentFixture<UploadImagesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadImagesSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadImagesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

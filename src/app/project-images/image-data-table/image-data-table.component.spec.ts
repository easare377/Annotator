import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDataTableComponent } from './image-data-table.component';

describe('ImageDataTableComponent', () => {
  let component: ImageDataTableComponent;
  let fixture: ComponentFixture<ImageDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageDataTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

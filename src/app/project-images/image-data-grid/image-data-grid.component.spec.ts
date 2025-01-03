import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDataGridComponent } from './image-data-grid.component';

describe('ImageDataGridComponent', () => {
  let component: ImageDataGridComponent;
  let fixture: ComponentFixture<ImageDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePolygonDialogComponent } from './generate-polygon-dialog.component';

describe('GeneratePolygonDialogComponent', () => {
  let component: GeneratePolygonDialogComponent;
  let fixture: ComponentFixture<GeneratePolygonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneratePolygonDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneratePolygonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

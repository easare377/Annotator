import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataTypeComponent } from './export-data-type.component';

describe('ExportDataTypeComponent', () => {
  let component: ExportDataTypeComponent;
  let fixture: ComponentFixture<ExportDataTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportDataTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportDataTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

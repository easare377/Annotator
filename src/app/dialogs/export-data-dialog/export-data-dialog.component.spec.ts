import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataDialogComponent } from './export-data-dialog.component';

describe('ExportDataDialogComponent', () => {
  let component: ExportDataDialogComponent;
  let fixture: ComponentFixture<ExportDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportDataDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

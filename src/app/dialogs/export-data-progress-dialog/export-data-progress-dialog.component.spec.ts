import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataProgressDialogComponent } from './export-data-progress-dialog.component';

describe('ExportDataProgressDialogComponent', () => {
  let component: ExportDataProgressDialogComponent;
  let fixture: ComponentFixture<ExportDataProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportDataProgressDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExportDataProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

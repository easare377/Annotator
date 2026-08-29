import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectSettingsDialogComponent} from './project-settings-dialog.component';

describe('ProjectSettingsDialogComponent', () => {
  let component: ProjectSettingsDialogComponent;
  let fixture: ComponentFixture<ProjectSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ProjectSettingsDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch visible settings sections without persisting changes', () => {
    component.selectSection('classes');

    expect(component.activeSection).toBe('classes');
  });
});

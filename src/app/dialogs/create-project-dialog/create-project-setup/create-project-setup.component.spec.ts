import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';

import { CreateProjectSetupComponent } from './create-project-setup.component';

describe('CreateProjectSetupComponent', () => {
  let component: CreateProjectSetupComponent;
  let fixture: ComponentFixture<CreateProjectSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CreateProjectSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateProjectSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trim surrounding spaces and allow supported separators', () => {
    component.createProjectVm.name = '   Road Damage-2026_test   ';

    component.normalizeProjectName();

    expect(component.createProjectVm.name).toBe('Road Damage-2026_test');
    expect(component.projectNameError).toBeNull();
    expect(component.isValid).toBeTrue();
  });

  it('should reject empty, oversized, and unsupported project names', () => {
    const invalidNames: string[] = ['', 'A'.repeat(51), 'Road Damage!'];

    for (const projectName of invalidNames) {
      component.createProjectVm.name = projectName;
      expect(component.projectNameError).not.toBeNull();
      expect(component.isValid).toBeFalse();
    }
  });

  it('should immediately remove unsupported characters from name input', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'Road@ Damage!_2026';
    input.setSelectionRange(input.value.length, input.value.length);

    component.onProjectNameInput({target: input} as unknown as Event);

    expect(input.value).toBe('Road Damage_2026');
    expect(component.createProjectVm.name).toBe('Road Damage_2026');
  });

  it('should immediately remove numbers from the beginning of a project name', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = '2026RoadDamage';
    input.setSelectionRange(input.value.length, input.value.length);

    component.onProjectNameInput({target: input} as unknown as Event);

    expect(input.value).toBe('RoadDamage');
    expect(component.createProjectVm.name).toBe('RoadDamage');
  });

  it('should enforce the description limit while allowing an empty description', () => {
    component.createProjectVm.name = 'Valid Project';
    component.createProjectVm.description = null;
    expect(component.descriptionError).toBeNull();
    expect(component.isValid).toBeTrue();

    component.createProjectVm.description = 'D'.repeat(256);
    expect(component.descriptionError).toContain('255');
    expect(component.isValid).toBeFalse();
  });
});

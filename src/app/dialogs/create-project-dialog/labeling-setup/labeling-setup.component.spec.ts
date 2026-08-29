import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelingSetupComponent } from './labeling-setup.component';
import {ObjectClassBase} from '../../../../models/object-class-base';

describe('LabelingSetupComponent', () => {
  let component: LabelingSetupComponent;
  let fixture: ComponentFixture<LabelingSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelingSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabelingSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should immediately remove non-alphanumeric characters', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'Vehicle- 2_test';
    input.setSelectionRange(input.value.length, input.value.length);

    component.onClassNameInput({target: input} as unknown as Event);

    expect(input.value).toBe('Vehicle2test');
  });

  it('should immediately remove numbers from the beginning of a class name', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = '2026Vehicle';
    input.setSelectionRange(input.value.length, input.value.length);

    component.onClassNameInput({target: input} as unknown as Event);

    expect(input.value).toBe('Vehicle');
  });

  it('should not add an empty or invalid class name', () => {
    component.addLabel('', 'Empty');
    component.addLabel('Invalid class', 'Contains a space');
    component.addLabel('2Vehicle', 'Starts with a number');

    expect(component.projectSetupVm.objectClasses).toHaveSize(0);
  });

  it('should add an alphanumeric class name', () => {
    component.addLabel('Vehicle2', 'Vehicle class');

    expect(component.projectSetupVm.objectClasses).toHaveSize(1);
    expect(component.projectSetupVm.objectClasses[0].className).toBe('Vehicle2');
  });

  it('should reject duplicate class names ignoring case', () => {
    component.addLabel('ClassName', 'First class');
    component.addLabel('classname', 'Duplicate class');
    component.addLabel('ClassName2', 'Distinct class');

    expect(component.projectSetupVm.objectClasses).toHaveSize(2);
    expect(component.isDuplicateClassName('CLASSNAME')).toBeTrue();
    expect(component.isDuplicateClassName('classname3')).toBeFalse();
  });

  it('should not add more than 255 classes', () => {
    for (let index = 0; index < component.maxObjectClasses; index++) {
      component.projectSetupVm.objectClasses.push(
        new ObjectClassBase(`Class${index}`, '#123456')
      );
    }

    expect(component.hasReachedClassLimit).toBeTrue();
    expect(component.canAddClassName('ExtraClass')).toBeFalse();

    component.addLabel('ExtraClass', 'Over the limit');
    expect(component.projectSetupVm.objectClasses).toHaveSize(255);
  });

  it('should assign distinct colors to new classes', () => {
    ['Car', 'Person', 'Tree', 'Road', 'Building', 'Animal'].forEach((className: string): void => {
      component.addLabel(className, '');
    });
    const colors: string[] = component.projectSetupVm.objectClasses
      .map((objectClass): string => objectClass.color);

    expect(new Set(colors).size).toBe(colors.length);
  });
});

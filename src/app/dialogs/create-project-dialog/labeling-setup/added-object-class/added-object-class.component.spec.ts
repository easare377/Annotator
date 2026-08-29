import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedObjectClassComponent } from './added-object-class.component';
import { ObjectClassBase } from '../../../../../models/object-class-base';
import { ColorPickerComponent } from '../color-picker/color-picker.component';

describe('AddedObjectClassComponent', () => {
  let component: AddedObjectClassComponent;
  let fixture: ComponentFixture<AddedObjectClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddedObjectClassComponent, ColorPickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddedObjectClassComponent);
    component = fixture.componentInstance;
    component.objectClassVm = new ObjectClassBase('Car', '#2563eb', 'Road vehicles');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the class details', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.class-name')?.textContent).toContain('Car');
    expect(element.querySelector('.class-description')?.textContent).toContain('Road vehicles');
    expect((element.querySelector('.class-color') as HTMLElement).style.backgroundColor).toBe('rgb(37, 99, 235)');
  });

  it('should emit remove when the remove button is clicked', () => {
    spyOn(component.remove, 'emit');

    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.remove-button');
    removeButton.click();

    expect(component.remove.emit).toHaveBeenCalled();
  });

  it('should update the class color', () => {
    const colorInput: HTMLInputElement = fixture.nativeElement.querySelector('.color-input');

    colorInput.value = '#dc2626';
    colorInput.dispatchEvent(new Event('input'));

    expect(component.objectClassVm.color).toBe('#dc2626');
  });

  it('should expose the remove class tooltip', () => {
    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.remove-button');

    expect(removeButton.title).toBe('Remove class');
  });
});

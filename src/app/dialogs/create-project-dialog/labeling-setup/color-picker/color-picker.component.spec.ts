import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColorPickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected color', () => {
    spyOn(component.colorChange, 'emit');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.color-input');

    input.value = '#dc2626';
    input.dispatchEvent(new Event('input'));

    expect(component.color).toBe('#dc2626');
    expect(component.colorChange.emit).toHaveBeenCalledWith('#dc2626');
  });

  it('should expose the pick color tooltip', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.color-input');

    expect(input.title).toBe('Pick color');
  });
});

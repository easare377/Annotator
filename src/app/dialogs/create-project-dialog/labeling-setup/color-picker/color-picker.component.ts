import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css'
})
export class ColorPickerComponent {
  @Input() color = '#2563eb';
  @Input() ariaLabel = 'Choose class color';
  @Input() tooltip = 'Pick color';
  @Output() colorChange = new EventEmitter<string>();

  onColorInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.color = input.value;
    this.colorChange.emit(this.color);
  }
}

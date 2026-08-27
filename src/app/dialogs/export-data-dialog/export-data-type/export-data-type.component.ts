import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-export-data-type',
  templateUrl: './export-data-type.component.html',
  styleUrl: './export-data-type.component.css'
})
export class ExportDataTypeComponent{
  @Input() typeText!: string;
  @Input() typeDescription!: string;
  @Input() disabled: boolean = false;
  @Output() selected = new EventEmitter<void>();
}

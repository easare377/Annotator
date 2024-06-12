import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-label-list',
  templateUrl: './label-list.component.html',
  styleUrls: ['./label-list.component.css']
})
export class LabelListComponent {
  @Input() labels: { name: string, color: string }[] = [];
  @Output() labelRemoved = new EventEmitter<{ name: string, color: string }>();

  removeLabel(label: { name: string, color: string }) {
    this.labelRemoved.emit(label);
  }
}

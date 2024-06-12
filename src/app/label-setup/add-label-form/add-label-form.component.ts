import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-label-form',
  templateUrl: './add-label-form.component.html',
  styleUrls: ['./add-label-form.component.css']
})
export class AddLabelFormComponent {
  newLabels: string = '';
  @Output() labelsAdded = new EventEmitter<string[]>();

  addLabels() {
    const labels = this.newLabels.split('\n').filter(label => label.trim());
    this.labelsAdded.emit(labels);
    this.newLabels = '';
  }
}

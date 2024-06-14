import { Component } from '@angular/core';

@Component({
  selector: 'app-labeling-setup',
  templateUrl: './labeling-setup.component.html',
  styleUrl: './labeling-setup.component.css'
})
export class LabelingSetupComponent {
  

  color:string="white"

  newLabels: string = '';
  labels: { name: string, color: string }[] = [];

  addLabels() {
    const labelsToAdd = this.newLabels.split('\n').filter(label => label.trim());
    this.labels.push(...labelsToAdd.map(label => ({
      name: label,
      color: this.getRandomColor()
    })));
    this.newLabels = '';
  }

  removeLabel(labelToRemove: { name: string, color: string }) {
    this.labels = this.labels.filter(label => label !== labelToRemove);
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}




import { Component } from '@angular/core';

@Component({
  selector: 'app-label-setup',
  templateUrl: './label-setup.component.html',
  styleUrls: ['./label-setup.component.css']
})
export class LabelSetupComponent {
  labels: { name: string, color: string }[] = [];

  addLabels(newLabels: string[]) {
    this.labels.push(...newLabels.map(label => ({
      name: label,
      color: this.getRandomColor()
    })));
  }

  removeLabel(label: { name: string, color: string }) {
    this.labels = this.labels.filter(l => l !== label);
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  save() {
    // Implement save functionality
  }

  delete() {
    // Implement delete functionality
  }
}

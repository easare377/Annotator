
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent {
  @Input() labels: { name: string, color: string }[] = [];
  placedLabels: { name: string, color: string, x: number, y: number }[] = [];

  onImageClick(event: MouseEvent) {
    const selectedLabel = this.labels[0]; // For simplicity, we'll use the first label in the list
    if (selectedLabel) {
      this.placedLabels.push({
        ...selectedLabel,
        x: event.offsetX,
        y: event.offsetY
      });
    }
  }
}

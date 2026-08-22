import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PolygonViewModel} from "../../../models/polygon-view-model";

@Component({
  selector: 'app-annotated-polygon',
  templateUrl: './annotated-polygon.component.html',
  styleUrl: './annotated-polygon.component.css'
})
export class AnnotatedPolygonComponent {

  @Input() index!: number;
  @Input() polygonVm!: PolygonViewModel;
  @Output() clearAnnotation = new EventEmitter<PolygonViewModel>();

  get displayIndex(): string {
    return (this.index + 1).toString().padStart(2, '0');
  }

  get className(): string {
    return this.polygonVm.objectClassVm?.className ?? 'Unassigned';
  }

  get classColor(): string {
    return this.polygonVm.objectClassVm?.color ?? '#94a3b8';
  }

  setHighlighted(active: boolean): void {
    this.polygonVm.mouseOver = active;
    if (this.polygonVm.onMouseOver) {
      this.polygonVm.onMouseOver();
    } else {
      this.polygonVm.drawPolygon();
    }
  }

  onClear(event: Event): void {
    event.stopPropagation();
    this.clearAnnotation.emit(this.polygonVm);
  }
}

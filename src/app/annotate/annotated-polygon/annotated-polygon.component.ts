import {Component, Input} from '@angular/core';
import {ObjectClassViewModel} from "../../../models/object-class-view-model";
import {PolygonViewModel} from "../../../models/polygon-view-model";

@Component({
  selector: 'app-annotated-polygon',
  templateUrl: './annotated-polygon.component.html',
  styleUrl: './annotated-polygon.component.css'
})
export class AnnotatedPolygonComponent {

  @Input() index!: number;
  @Input() polygonVm!: PolygonViewModel;

}

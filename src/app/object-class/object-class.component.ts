import {Component, Input} from '@angular/core';
import {ObjectClassViewModel} from "../../models/object-class-view-model";
import {Utils} from "../utils";

@Component({
  selector: 'app-object-class',
  templateUrl: './object-class.component.html',
  styleUrl: './object-class.component.css'
})
export class ObjectClassComponent {
  @Input() objectClassVm!: ObjectClassViewModel;
  @Input() active: boolean = false;

  constructor() {

  }

  protected readonly Utils = Utils;
}

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ObjectClassBase} from "../../../../../models/object-class-base";

@Component({
  selector: 'app-added-object-class',
  templateUrl: './added-object-class.component.html',
  styleUrl: './added-object-class.component.css'
})
export class AddedObjectClassComponent {
  @Input({required: true}) objectClassVm!: ObjectClassBase;
  @Output() remove = new EventEmitter<void>();
}

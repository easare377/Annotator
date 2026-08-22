import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ObjectClassBase} from "../../../../../models/object-class-base";

@Component({
  selector: 'app-added-object-class',
  templateUrl: './added-object-class.component.html',
  styleUrl: './added-object-class.component.css'
})
export class AddedObjectClassComponent implements OnInit{
  @Input() objectClassVm!: ObjectClassBase;
  @Output() remove = new EventEmitter();

  ngOnInit(): void {
  }
}

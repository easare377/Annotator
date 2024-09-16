import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgIf, NgForOf} from "@angular/common";
import {Dialog} from "../dialog";
import {ObjectClassViewModel} from "../../../models/object-class-view-model";
import {PolygonViewModel} from "../../../models/polygon-view-model";

@Component({
  selector: 'app-assign-class-dialog',
  templateUrl: './assign-class-dialog.component.html',
  styleUrls: ['./assign-class-dialog.component.css', '../dialog.css']
})
export class AssignClassDialogComponent extends Dialog implements OnInit {
  @Input() objectClassVms!: Array<ObjectClassViewModel>;
  @Input() polygonVm: PolygonViewModel | undefined;
  @Output() objectClassSelected: EventEmitter<ObjectClassViewModel> | undefined

  constructor() {
    super();
  }

  ngOnInit(): void {
    // this.objectClassVms
  }

  setClass(objectClassVm: any): void {
    if (this.polygonVm) {
      this.polygonVm.objectClassVm = objectClassVm;
    }
  }
}

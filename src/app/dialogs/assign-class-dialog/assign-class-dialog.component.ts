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
export class AssignClassDialogComponent extends Dialog implements OnInit{
  public objectClassVms: Array<ObjectClassViewModel | undefined>;
  @Input() polygonVm: PolygonViewModel | undefined;
  @Output() objectClassSelected: EventEmitter<ObjectClassViewModel> | undefined

  constructor() {
    super();
    const colors: string[] = ['#E91E63', '#FFBB86', '#000187', '#8A2BE2'];
    this.objectClassVms = new Array<ObjectClassViewModel>();
    this.objectClassVms.push(new ObjectClassViewModel('','Tree', colors[0]));
    this.objectClassVms.push(new ObjectClassViewModel('','Charcoal', colors[1]));
    this.objectClassVms.push(new ObjectClassViewModel('','Road', colors[2]));
    this.objectClassVms.push(new ObjectClassViewModel('','Building', colors[3]));
    // this.polygonVm ? this.polygonVm.objectClassVm  = this.objectClassVms[0]:''
  }

  ngOnInit(): void {
    // this.objectClassVms
  }

  setClass(objectClassVm: any): void {
    if (this.polygonVm){
      this.polygonVm.objectClassVm= objectClassVm;
    }
  }

}

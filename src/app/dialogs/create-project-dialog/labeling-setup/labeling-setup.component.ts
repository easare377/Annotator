import {Component, Input} from '@angular/core';
import {ObjectClassBase} from "../../../../models/object-class-base";
import {ProjectSetupViewModel} from "../../../../models/project-setup-view-model";
import {AnnotationType} from "../../../../models/enum/annotation-type";

@Component({
  selector: 'app-labeling-setup',
  templateUrl: './labeling-setup.component.html',
  styleUrl: './labeling-setup.component.css'
})
export class LabelingSetupComponent {

  @Input() visible = false;
  color:string="white"
  newLabels: string = '';
  labels: { name: string, color: string }[] = [];
  public projectSetupVm: ProjectSetupViewModel
  // public objectClassVm: ObjectClassBase[] = [];

  constructor() {
    this.projectSetupVm = new ProjectSetupViewModel(AnnotationType.POLYGON, new Array<ObjectClassBase>());
  }

  addLabel(className: string, description: string): void{
    const color = this.getRandomColor();
    const objectClassVm = new ObjectClassBase(className, color, description);
    this.projectSetupVm.objectClasses.push(objectClassVm);
  }

  removeLabel(objectClassVm: ObjectClassBase) {
    const indx = this.projectSetupVm.objectClasses.findIndex(obj => obj === objectClassVm);
    if (indx !== -1) {
      this.projectSetupVm.objectClasses.splice(indx, 1);
    }
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




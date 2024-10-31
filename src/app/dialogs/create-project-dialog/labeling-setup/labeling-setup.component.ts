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
  selectedClass :any

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
  selectClassForColorChange(classItem:ObjectClassBase) {
    this.selectedClass = classItem;
    console.log(classItem) // Set the selected class
  }
  handleColorChange(event: any) {
    const newColor = event.target.value;

    // Find the index of the selected object class
    const index = this.projectSetupVm.objectClasses.findIndex(obj => obj === this.selectedClass);

    if (index !== -1) {
      // Create a new instance of ObjectClassBase with the updated color
      const oldObject = this.projectSetupVm.objectClasses[index];
      const newObject = new ObjectClassBase(oldObject.className, newColor, oldObject.description);

      // Replace the old object with the new instance in the array
      this.projectSetupVm.objectClasses.splice(index, 1, newObject);
      this.selectedClass=newObject

      // Additional actions if needed (e.g., backend updates, UI refresh)
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




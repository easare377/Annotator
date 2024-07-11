import {Component, Input} from '@angular/core';
import {CreateProjectViewModel} from "../../../../models/create-project-view-model";

@Component({
  selector: 'app-create-project-setup',
  templateUrl: './create-project-setup.component.html',
  styleUrls: ['./create-project-setup.component.css', '../create-project-dialog.component.css']
})
export class CreateProjectSetupComponent {
  @Input() visible = false;
  public createProjectVm : CreateProjectViewModel;

  constructor() {
    this.createProjectVm = new CreateProjectViewModel('');

  }
}

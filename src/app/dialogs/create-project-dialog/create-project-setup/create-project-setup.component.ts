import {Component, Input} from '@angular/core';
import {CreateProjectViewModel} from "../../../../models/create-project-view-model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-create-project-setup',
  templateUrl: './create-project-setup.component.html',
  styleUrls: ['./create-project-setup.component.css', '../create-project-dialog.component.css']
})
export class CreateProjectSetupComponent {
  @Input() visible = false;
  public createProjectVm : CreateProjectViewModel;
  name: string | undefined;
  alert = false;
  description: string | undefined;
  // form: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.form = this.fb.group({
    //   name: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   // Add other form controls here
    // });
    this.createProjectVm = new CreateProjectViewModel('', null);
  }

  public validateForm() {

  }

  public getCreateProjectVm():CreateProjectViewModel{
    if (this.name){

    }
    return new CreateProjectViewModel('', null);
  }
}

import { Component, input, Input } from '@angular/core';
import {CreateProjectViewModel} from "../../../../models/create-project-view-model";
import {ProjectSetupViewModel} from "../../../../models/project-setup-view-model";

@Component({
  selector: 'app-submit-review-setup',
  templateUrl: './submit-review-setup.component.html',
  styleUrl: './submit-review-setup.component.css'
})
export class SubmitReviewSetupComponent{

  @Input() visible:boolean =false
  @Input() projectdetails:CreateProjectViewModel|undefined
  @Input() labelingdetails:ProjectSetupViewModel |undefined


}

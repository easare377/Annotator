import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  nameFormGroup: FormGroup |any;     // Add name form group
  addressFormGroup: FormGroup | any;  // Add address form group

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // Initialize the form groups
    this.nameFormGroup = this._formBuilder.group({
      name: ['', Validators.required]    // 'name' field in the first step
    });

    this.addressFormGroup = this._formBuilder.group({
      address: ['', Validators.required]  // 'address' field in the second step
    });
  }

  // Add onComplete method for the final step
  onComplete() {
    console.log("Form Completed");
    console.log("Name:", this.nameFormGroup.value.name);
    console.log("Address:", this.addressFormGroup.value.address);
  }
}



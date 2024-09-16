import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css'
})
export class CreateProjectComponent{
  personalInfoFormGroup: FormGroup |any;
  usageInfoFormGroup: FormGroup |any;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.personalInfoFormGroup = this._formBuilder.group({
      type: ['', Validators.required]
    });
    this.usageInfoFormGroup = this._formBuilder.group({
      usage: ['', Validators.required]
    });
  }

  onFinish() {
    console.log('Form completed');
    // Handle form submission
  }

}


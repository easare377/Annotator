import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  fieldTextType: boolean=true;
  signInForm=this.fb.group({
    gmail:["",[Validators.email,Validators.required,Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{1,}$')]],
    password:["",[Validators.required,Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]]
    // password:["",[Validators.required,Validators.minLength(8),Validators.pattern('(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]

  });
  isSubmitted=false;
  constructor(private fb:FormBuilder){

  }

  activeTab: string = 'signUp';
  setActiveTab(tab:string){
    this.activeTab=tab

  }
  onSubmit(){
    console.log("Form submitted",this.signInForm)
    this.isSubmitted=true;
  }
  

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
 
}

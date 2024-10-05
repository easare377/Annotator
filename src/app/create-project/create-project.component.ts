import { Component } from '@angular/core';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent {
  currentStep: number = 1; // Current step for the progress bar
  newClassName: string = ''; // Holds the input for class name
  newClassDescription: string = ''; // Holds the input for class description
  selectedClass: any = null; // Holds the currently selected class for color change

  // Properties to track if fields are valid or not
  isProjectNameInvalid: boolean = false;
  isProjectDescriptionInvalid: boolean = false;

  formData = {
    projectName: '',
    projectDescription: '',
    className: '',
    description: ''
  };

  addedClasses: Array<{ name: string; color: string; description: string }> = [{
    name: 'Class 1',
    color: this.generateRandomColor(),
    description: 'This is a hardcoded class 1'
  },
  {
    name: 'Class 2',
    color: this.generateRandomColor(),
    description: 'This is a hardcoded class 2'
  },
  {
    name: 'Class 3',
    color: this.generateRandomColor(),
    description: 'This is a hardcoded class 3'
  }]; // Holds added classes with random colors and descriptions

  // Function to check if the "Project Details" form is valid
  isProjectDetailsValid() {
    this.isProjectNameInvalid = this.formData.projectName.trim() === '';
    this.isProjectDescriptionInvalid = this.formData.projectDescription.trim() === '';

    return !this.isProjectNameInvalid && !this.isProjectDescriptionInvalid;
  }

  // Function to go to the next step and check if the current step is valid
  nextStep() {
    if (this.currentStep === 1 && !this.isProjectDetailsValid()) {
      return; // Stop if form is invalid
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  // Function to move to the previous step
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Function to generate random color
  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Function to add class with a random color and description
  addClass() {
    if (this.newClassName.trim() && this.newClassDescription.trim()) {
      const newClass = {
        name: this.newClassName,
        color: this.generateRandomColor(),
        description: this.newClassDescription
      };
      this.addedClasses.push(newClass);
      this.newClassName = ''; // Clear input
      this.newClassDescription = ''; // Clear description input
    }
  }

  // Function to remove a class
  removeClass(classItem: { name: string; color: string; description: string }) {
    this.addedClasses = this.addedClasses.filter((item) => item !== classItem);
  }

  // Function to select a class for color change
  selectClassForColorChange(classItem: { name: string; color: string; description: string }) {
    this.selectedClass = classItem; // Set the selected class
  }

  // Function to handle color change from color picker
  handleColorChange(event: any) {
    const newColor = event.target.value;
    if (this.selectedClass) {
      this.selectedClass.color = newColor; // Update color of the selected class
    }
  }

  // Function to submit form
  submitForm() {
    console.log('Form Submitted:', this.formData);
    console.log('Added Classes:', this.addedClasses);
  }

  // Function to cancel form
  cancelForm() {
    this.formData = {
      projectName: '',
      projectDescription: '',
      className: '',
      description: ''
    };
    this.currentStep = 1;
  }
}

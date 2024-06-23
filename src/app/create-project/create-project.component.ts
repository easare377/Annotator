import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
// import { ActiveTab } from '../../models/enum/ActiveTab';

// enum ActiveTab {
//   CREATEPROJECT = 'createproject',
//   DATAIMPORT = "dataimport",
//   LABELINGSETUP='labelingsetup'
// }

/**
 * Represents the Create Project component.
 * This component is responsible for creating a new project.
 */
@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  
  /**
   * Holds the name of the active tab.
   * @default 'projectName'
   */
  activeTab: string = 'projectName';
 

  /**
   * Holds the list of selected files.
   */
  files: File[] = [];

  /**
   * References the file input element in the template.
   */
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  /**
   * Initializes a new instance of the CreateProjectComponent class.
   */
  constructor() { }

  /**
   * A lifecycle hook that is called after Angular has initialized all data-bound properties.
   */
  ngOnInit(): void { }

  /**
   * Sets the active tab.
   * @param tab The name of the tab to set as active.
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Handles the drag over event to allow files to be dragged over the drop area.
   * @param event The drag event.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Handles the drop event to add dropped files to the file list.
   * @param event The drop event.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
    }
  }

  /**
   * Handles the file selected event to add selected files to the file list.
   * @param event The file input change event.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.files.push(file));
    }
  }

  /**
   * Triggers the file input element to open the file selector dialog.
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}

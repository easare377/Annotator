import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  activeTab: string = 'projectName';
  files: File[] = [];

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => this.files.push(file));
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}

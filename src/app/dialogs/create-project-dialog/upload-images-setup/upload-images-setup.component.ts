import {Component, Input} from '@angular/core';
import {FileUploadService} from "../../../file-upload.service";
import {HttpService} from "../../../../services/http.service";
import {UploadFileRequestBody} from "../../../../models/upload-file-request-body";
import {AppManagerService} from "../../../../services/app-manager.service";

@Component({
  selector: 'app-upload-images-setup',
  templateUrl: './upload-images-setup.component.html',
  styleUrl: './upload-images-setup.component.css'
})
export class UploadImagesSetupComponent {
  @Input() visible: boolean = false;
  files: File[] = [];
  selectedFiles?: FileList;
  @Input() projectId!: string;
  // progress = 0;
  // message = '';

  constructor(private httpService: HttpService, private appManagerService: AppManagerService) {
    this.projectId = this.appManagerService.getData('projectId');
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file: File = this.selectedFiles[i];
        this.files.push(file);
      }
    }
  }

  async uploadImageAsync(): Promise<void> {
    // this.files.forEach()
    if (this.selectedFiles) {
      const uploadImageRequestBody = new UploadFileRequestBody(this.projectId);
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file: File = this.selectedFiles[i];
        await this.httpService.uploadImageAsync(uploadImageRequestBody,file);
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      // Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
    }
  }
}

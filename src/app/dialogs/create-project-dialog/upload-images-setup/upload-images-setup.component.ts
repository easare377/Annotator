import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FileUploadService} from "../../../file-upload.service";
import {HttpService} from "../../../../services/http.service";
import {UploadFileRequestBody} from "../../../../models/upload-file-request-body";
import {AppManagerService} from "../../../../services/app-manager.service";
import {FileUploadViewModel} from "../../../../models/file-upload-view-model";
import {ImageInfoResponseBody} from "../../../../models/image-info-response-body";

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
  dragActive = false;
  // progress = 0;
  // message = '';
  fileUploadVms: FileUploadViewModel[] = [];
  @Output() imagesUploaded = new EventEmitter<ImageInfoResponseBody[]>();

  constructor(private httpService: HttpService, private appManagerService: AppManagerService) {
    this.projectId = this.appManagerService.getData('projectId');
  }

  // onFileSelected(event: any): void {
  //   this.selectedFiles = event.target.files;
  //   if (this.selectedFiles) {
  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       const file: File = this.selectedFiles[i];
  //       this.files.push(file);
  //     }
  //   }
  // }
  //
  // async uploadImageAsync(): Promise<void> {
  //   // this.files.forEach()
  //   if (this.selectedFiles) {
  //     const uploadImageRequestBody = new UploadFileRequestBody(this.projectId);
  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       const file: File = this.selectedFiles[i];
  //       await this.httpService.uploadImageAsync(uploadImageRequestBody,file);
  //     }
  //   }
  // }
  //
  // onDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   if (event.dataTransfer?.files) {
  //     // Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
  //   }
  // }

  onFileSelected(event: Event): void {
    // const input = event.target as HTMLInputElement;
    // if (input.files) {
    //   this.addFiles(input.files);
    //   input.value = ''; // clear input for re-uploading same file
    // }
    const input = event.target as HTMLInputElement;
    if (input.files){
      const selectedFiles = input.files;
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file: File = selectedFiles[i];
          this.fileUploadVms.push(new FileUploadViewModel(file))
        }
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
    if (event.dataTransfer && event.dataTransfer.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  addFiles(fileList: FileList) {
    Array.from(fileList).forEach(f => {
      if (!this.files.find(x => x.name === f.name && x.size === f.size)) {
        this.files.push(f);
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;
  }
}

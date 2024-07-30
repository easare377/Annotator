import {Component, Input} from '@angular/core';
import {FileUploadViewModel} from "../../../../models/file-upload-view-model";
import {UploadState} from "../../../../models/enum/upload-state";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  protected readonly UploadState = UploadState;
  @Input() fileUploadVm!: FileUploadViewModel;
}

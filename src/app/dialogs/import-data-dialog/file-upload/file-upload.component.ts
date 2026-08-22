import {Component, EventEmitter, Input, Output} from '@angular/core';
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
  @Output() retry = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  get formattedFileSize(): string {
    const bytes: number = this.fileUploadVm.file.size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  get canRemove(): boolean {
    return this.fileUploadVm.uploadState !== UploadState.UPLOADING;
  }
}

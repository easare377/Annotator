import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dialog} from "../dialog";
import {UploadFileRequestBody} from "../../../models/upload-file-request-body";
import {HttpService} from "../../../services/http.service";
import {AppManagerService} from "../../../services/app-manager.service";
import {HttpResponse} from "@angular/common/http";
import {ImageInfoResponseBody} from "../../../models/image-info-response-body";
import {NavigationService} from "../../../services/navigation.service";
import {FileUploadViewModel} from "../../../models/file-upload-view-model";
import {UploadState} from "../../../models/enum/upload-state";


@Component({
  selector: 'app-import-data-dialog',
  templateUrl: './import-data-dialog.component.html',
  styleUrls: ['./import-data-dialog.component.css', '../dialog.css']
})
export class ImportDataDialogComponent extends Dialog implements OnInit {
  // files: File[] = [];
  fileUploadVms: FileUploadViewModel[] = [];
  @Input() projectId!: string;

  @Output() imagesUploaded = new EventEmitter<ImageInfoResponseBody[]>();

  constructor(private httpService: HttpService, public navService: NavigationService,
              private appManagerService: AppManagerService) {
    super();
  }

  ngOnInit(): void {
    // this.projectId = this.appManagerService.getData('projectId');
    // if (this.projectId)
    //   this.getProjectDataAsync(this.projectId).then();
  }

  onFileSelected(event: any): void {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file: File = selectedFiles[i];
        this.fileUploadVms.push(new FileUploadViewModel(file))
      }
    }
    this.uploadImageAsync().then();
  }

  async uploadImageAsync(): Promise<void> {
    for (let fileUploadVm of this.fileUploadVms) {
      const uploadImageRequestBody = new UploadFileRequestBody(this.projectId);
      try {
        fileUploadVm.uploadState = UploadState.UPLOADING
        const resp: HttpResponse<ImageInfoResponseBody[]> =
          await this.httpService.uploadImageAsync(uploadImageRequestBody, fileUploadVm.file);
        switch (resp.status) {
          case 200:
            if (!resp.body) {
              throw new Error();
            }
            this.imagesUploaded.emit(resp.body);
            fileUploadVm.uploadState = UploadState.UPLOADED
            // this.hideDialog();
            break;
          default:
            throw new Error();
        }
      } catch (e) {
        fileUploadVm.uploadState = UploadState.FAILED
        console.log(e);
      }
    }
    // for (let i = 0)
    // if (this.selectedFiles) {
    //   const uploadImageRequestBody = new UploadFileRequestBody(this.projectId);
    //   for (let i = 0; i < this.selectedFiles.length; i++) {
    //     const file: File = this.selectedFiles[i];
    //     await this.httpService.uploadImageAsync(uploadImageRequestBody,file);
    //   }
    // }
  }

  private resetDialog(): void {
    this.fileUploadVms = [];
    // this.projectId = undefined;
  }

  override hideDialog() {
    this.resetDialog();
    super.hideDialog();
  }
}

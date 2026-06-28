import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dialog} from "../dialog";
import {UploadFileRequestBody} from "../../../models/upload-file-request-body";
import {HttpService} from "../../../services/http.service";
import {AppManagerService} from "../../../services/app-manager.service";
import { HttpResponse } from "@angular/common/http";
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
  private readonly supportedImageTypes: Set<string> = new Set<string>([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff'
  ]);
  private readonly supportedImageExtensions: Set<string> = new Set<string>([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'bmp',
    'tif',
    'tiff'
  ]);
  private readonly maxConcurrentUploads: number = 3;
  private activeUploadCount: number = 0;
  private uploadCompletionPromise: Promise<void> | undefined;
  private resolveUploadCompletion: (() => void) | undefined;
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

  onFileSelected(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    Array.from(input.files ?? []).filter((file: File) => this.isSupportedImage(file)).forEach((file: File) => {
      this.fileUploadVms.push(new FileUploadViewModel(file));
    });
    input.value = '';
    void this.uploadImageAsync();
  }

  private isSupportedImage(file: File): boolean {
    const extension: string = file.name.split('.').pop()?.toLowerCase() ?? '';
    return this.supportedImageTypes.has(file.type.toLowerCase()) &&
      this.supportedImageExtensions.has(extension);
  }

  uploadImageAsync(): Promise<void> {
    if (!this.hasOutstandingUploads()) {
      return Promise.resolve();
    }

    if (!this.uploadCompletionPromise) {
      this.uploadCompletionPromise = new Promise<void>((resolve: () => void) => {
        this.resolveUploadCompletion = resolve;
      });
    }

    this.startPendingUploads();
    return this.uploadCompletionPromise;
  }

  private startPendingUploads(): void {
    while (this.activeUploadCount < this.maxConcurrentUploads) {
      const fileUploadVm: FileUploadViewModel | undefined =
        this.fileUploadVms.find((item: FileUploadViewModel) => item.uploadState === UploadState.PENDING);
      if (!fileUploadVm) break;

      fileUploadVm.uploadState = UploadState.UPLOADING;
      this.activeUploadCount++;
      void this.uploadFileAsync(fileUploadVm).finally(() => {
        this.activeUploadCount--;
        this.startPendingUploads();
        this.completeQueueWhenIdle();
      });
    }
    this.completeQueueWhenIdle();
  }

  private async uploadFileAsync(fileUploadVm: FileUploadViewModel): Promise<void> {
    const uploadImageRequestBody = new UploadFileRequestBody(this.projectId);
    try {
      const resp: HttpResponse<ImageInfoResponseBody[]> =
        await this.httpService.uploadImageAsync(uploadImageRequestBody, fileUploadVm.file);
      if (resp.status !== 200 || !resp.body) {
        throw new Error('Image upload failed.');
      }
      this.imagesUploaded.emit(resp.body);
      fileUploadVm.uploadState = UploadState.UPLOADED;
    } catch (error) {
      fileUploadVm.uploadState = UploadState.FAILED;
      console.error(error);
    }
  }

  private hasOutstandingUploads(): boolean {
    return this.activeUploadCount > 0 ||
      this.fileUploadVms.some((item: FileUploadViewModel) => item.uploadState === UploadState.PENDING);
  }

  private completeQueueWhenIdle(): void {
    if (this.hasOutstandingUploads()) return;
    this.resolveUploadCompletion?.();
    this.resolveUploadCompletion = undefined;
    this.uploadCompletionPromise = undefined;
  }

  retryUpload(fileUploadVm: FileUploadViewModel): void {
    if (fileUploadVm.uploadState !== UploadState.FAILED) return;
    fileUploadVm.uploadState = UploadState.PENDING;
    void this.uploadImageAsync();
  }

  private resetDialog(): void {
    this.fileUploadVms = [];
  }

  override hideDialog(): void {
    this.resetDialog();
    super.hideDialog();
  }
}

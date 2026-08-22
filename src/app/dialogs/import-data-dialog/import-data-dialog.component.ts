import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Dialog} from "../dialog";
import {UploadFileRequestBody} from "../../../models/upload-file-request-body";
import {HttpService} from "../../../services/http.service";
import { HttpResponse } from "@angular/common/http";
import {ImageInfoResponseBody} from "../../../models/image-info-response-body";
import {FileUploadViewModel} from "../../../models/file-upload-view-model";
import {UploadState} from "../../../models/enum/upload-state";
import {
  ConfirmationDialogComponent
} from "../confirmation-dialog/confirmation-dialog.component";


@Component({
  selector: 'app-import-data-dialog',
  templateUrl: './import-data-dialog.component.html',
  styleUrls: ['./import-data-dialog.component.css', '../dialog.css']
})
export class ImportDataDialogComponent extends Dialog {
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
  isDragging: boolean = false;
  @Input() projectId!: string;

  @Output() imagesUploaded = new EventEmitter<ImageInfoResponseBody[]>();
  @Output() importClosed = new EventEmitter<void>();

  constructor(private httpService: HttpService) {
    super();
  }

  onFileSelected(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    this.queueFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    const dropZone: HTMLElement = event.currentTarget as HTMLElement;
    const nextTarget: Node | null = event.relatedTarget as Node | null;
    if (!nextTarget || !dropZone.contains(nextTarget)) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.queueFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  private queueFiles(files: File[]): void {
    files.filter((file: File) => this.isSupportedImage(file)).forEach((file: File) => {
      this.fileUploadVms.push(new FileUploadViewModel(file));
    });
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
        await this.httpService.uploadImageAsync(
          uploadImageRequestBody,
          fileUploadVm.file,
          (progress: number) => fileUploadVm.uploadProgress = Math.min(progress, 95)
        );
      if (resp.status !== 200 || !resp.body) {
        throw new Error('Image upload failed.');
      }
      this.imagesUploaded.emit(resp.body);
      fileUploadVm.uploadProgress = 100;
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
    fileUploadVm.uploadProgress = 0;
    fileUploadVm.uploadState = UploadState.PENDING;
    void this.uploadImageAsync();
  }

  removeUpload(fileUploadVm: FileUploadViewModel): void {
    if (fileUploadVm.uploadState === UploadState.UPLOADING) return;
    const index: number = this.fileUploadVms.indexOf(fileUploadVm);
    if (index === -1) return;
    fileUploadVm.dispose();
    this.fileUploadVms.splice(index, 1);
  }

  get pendingUploadCount(): number {
    return this.countUploads(UploadState.PENDING);
  }

  get activeUploadCountForDisplay(): number {
    return this.countUploads(UploadState.UPLOADING);
  }

  get uploadedCount(): number {
    return this.countUploads(UploadState.UPLOADED);
  }

  get failedUploadCount(): number {
    return this.countUploads(UploadState.FAILED);
  }

  get uploadSummary(): string {
    const summary: string[] = [];
    if (this.activeUploadCountForDisplay) summary.push(`${this.activeUploadCountForDisplay} uploading`);
    if (this.pendingUploadCount) summary.push(`${this.pendingUploadCount} queued`);
    if (this.uploadedCount) summary.push(`${this.uploadedCount} uploaded`);
    if (this.failedUploadCount) summary.push(`${this.failedUploadCount} failed`);
    return summary.join(' · ');
  }

  get overallProgress(): number {
    if (!this.fileUploadVms.length) return 0;
    const totalProgress: number = this.fileUploadVms.reduce((total: number, item: FileUploadViewModel) => {
      if (item.uploadState === UploadState.UPLOADED || item.uploadState === UploadState.FAILED) {
        return total + 100;
      }
      return total + item.uploadProgress;
    }, 0);
    return Math.round(totalProgress / this.fileUploadVms.length);
  }

  get uploadsInProgress(): boolean {
    return this.hasOutstandingUploads();
  }

  get queueComplete(): boolean {
    return this.fileUploadVms.length > 0 && !this.uploadsInProgress;
  }

  requestClose(confirmDialog: ConfirmationDialogComponent): void {
    if (this.uploadsInProgress) {
      confirmDialog.showDialog();
      return;
    }
    this.closeAndRefresh();
  }

  closeAndRefresh(): void {
    this.hideDialog();
    this.importClosed.emit();
  }

  private countUploads(state: UploadState): number {
    return this.fileUploadVms.filter((item: FileUploadViewModel) => item.uploadState === state).length;
  }

  private resetDialog(): void {
    this.fileUploadVms.forEach((item: FileUploadViewModel) => item.dispose());
    this.fileUploadVms = [];
    this.isDragging = false;
  }

  override hideDialog(): void {
    this.resetDialog();
    super.hideDialog();
  }
}

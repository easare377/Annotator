import {UploadState} from "./enum/upload-state";

export class FileUploadViewModel {
  private readonly _file: File;
  private readonly _previewUrl: string;
  private _uploadState: UploadState = UploadState.PENDING;
  private _uploadProgress: number = 0;

  constructor(file: File) {
    this._file = file;
    this._previewUrl = URL.createObjectURL(file);
  }

  get file(): File {
    return this._file;
  }

  get uploadState(): UploadState {
    return this._uploadState;
  }

  set uploadState(value: UploadState) {
    this._uploadState = value;
  }

  get previewUrl(): string {
    return this._previewUrl;
  }

  get uploadProgress(): number {
    return this._uploadProgress;
  }

  set uploadProgress(value: number) {
    this._uploadProgress = Math.min(100, Math.max(0, Math.round(value)));
  }

  dispose(): void {
    URL.revokeObjectURL(this._previewUrl);
  }
}

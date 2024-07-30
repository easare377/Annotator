import {UploadState} from "./enum/upload-state";

export class FileUploadViewModel {
  private readonly _file: File;
  private _uploadState: UploadState = UploadState.UPLOADING;

  constructor(file: File) {
    this._file = file;
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
}

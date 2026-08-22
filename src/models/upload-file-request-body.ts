import {RequestBody} from "./request-body";

export class UploadFileRequestBody extends RequestBody{
  private readonly _projectId: string;

  constructor(projectId: string) {
    super();
    this._projectId = projectId;
  }

  get projectId(): string {
    return this._projectId;
  }
}

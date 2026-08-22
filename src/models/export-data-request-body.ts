import {RequestBody} from "./request-body";

export class ExportDataRequestBody extends RequestBody{
  private readonly _projectId: string;
  private readonly _classValueDict: Array<{classId: string; classValue: number}>;

  constructor(projectId: string, classValueDict: Array<{classId: string; classValue: number}>) {
    super();
    this._projectId = projectId;
    this._classValueDict = classValueDict;
  }

  get projectId(): string {
    return this._projectId;
  }

  get classValueDict(): Array<{classId: string; classValue: number}> {
    return this._classValueDict;
  }
}

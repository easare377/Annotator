import {ProjectInfoRequestBody} from "./project-info-request-body";

export class CreatedProjectResponseBody {
  private readonly _projectId: string;
  private readonly _projectInfos: ProjectInfoRequestBody[];


  constructor(projectId: string, projectInfos: ProjectInfoRequestBody[]) {
    this._projectId = projectId;
    this._projectInfos = projectInfos;
  }


  get projectId(): string {
    return this._projectId;
  }

  get projectInfos(): ProjectInfoRequestBody[] {
    return this._projectInfos;
  }
}

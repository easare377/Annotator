import {ProjectInfoBase} from "./project-info-base";

export class ProjectViewModel extends ProjectInfoBase{
  private readonly _projectId: string;
  private readonly _dateCreated: Date;

  constructor(projectId: string, name: string, dateCreated: Date, description: string | null) {
    super(name, description);
    this._projectId = projectId;
    this._dateCreated = dateCreated;
  }


  get projectId(): string {
    return this._projectId;
  }

  get dateCreated(): Date {
    return this._dateCreated;
  }
}

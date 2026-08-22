import {ProjectSetupBase} from "./project-setup-base";
import {ProjectInfoBase} from "./project-info-base";

export class ProjectInfoRequestBody extends ProjectInfoBase {
  private readonly _projectSetup: ProjectSetupBase;

  constructor(name: string, projectSetup: ProjectSetupBase, description: string | null) {
    super(name, description);
    this._projectSetup = projectSetup;
  }

  get projectSetup(): ProjectSetupBase {
    return this._projectSetup;
  }
}

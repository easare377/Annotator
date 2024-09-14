import {ProjectInfoBase} from "./project-info-base";
import {ProjectSetupBase} from "./project-setup-base";

export class CreateProjectViewModel extends ProjectInfoBase {

  constructor(name: string, description: string | null, projectSetup?: ProjectSetupBase) {
    super(name, description);
  }
}

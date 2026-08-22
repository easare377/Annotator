import {ImageInfoResponseBody} from "./image-info-response-body";
import {ProjectSetupResponseBody} from "./project-setup-response-body";
import {ProjectInfoResponseBody} from "./project-info-response-body";

export class ProjectDataResponseBody {
  private readonly _projectInfo: ProjectInfoResponseBody;
  private readonly _projectSetup: ProjectSetupResponseBody;
  private readonly _imageInfos: ImageInfoResponseBody[];


  constructor(projectInfo: ProjectInfoResponseBody, projectSetup: ProjectSetupResponseBody, imageInfos: ImageInfoResponseBody[]) {
    this._projectInfo = projectInfo;
    this._projectSetup = projectSetup;
    this._imageInfos = imageInfos;
  }

  get projectInfo(): ProjectInfoResponseBody {
    return this._projectInfo;
  }

  get projectSetup(): ProjectSetupResponseBody {
    return this._projectSetup;
  }

  get imageInfos(): ImageInfoResponseBody[] {
    return this._imageInfos;
  }
}

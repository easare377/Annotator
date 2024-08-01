import {ImageInfoResponseBody} from "./image-info-response-body";
import {ProjectSetupResponseBody} from "./project-setup-response-body";

export class ProjectDataResponseBody {
  private readonly _projectSetup: ProjectSetupResponseBody;
  private readonly _imageInfos: ImageInfoResponseBody[];


  constructor(projectSetup: ProjectSetupResponseBody, imageInfos: ImageInfoResponseBody[]) {
    this._projectSetup = projectSetup;
    this._imageInfos = imageInfos;
  }


  get projectSetup(): ProjectSetupResponseBody {
    return this._projectSetup;
  }

  get imageInfos(): ImageInfoResponseBody[] {
    return this._imageInfos;
  }
}

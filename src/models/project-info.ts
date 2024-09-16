import {ProjectInfoResponseBody} from "./project-info-response-body";
import {ImageInfoResponseBody} from "./image-info-response-body";
import {ImageInfo} from "./image-info";

export class ProjectInfo extends ProjectInfoResponseBody{
  // private imageInfo: ImageInfo;
  constructor(projectId: string, name: string, dateCreated: Date, description: string) {
    super(projectId, name, dateCreated, description);
  }


}

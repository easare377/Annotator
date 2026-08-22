import {ProjectSetupBase} from "./project-setup-base";
import {AnnotationType} from "./enum/annotation-type";
import {ObjectClassBase} from "./object-class-base";

export class ProjectSetupViewModel extends ProjectSetupBase{

  // override set annotationType(value: AnnotationType | undefined) {
  //   this._annotationType = value;
  // }
  constructor(annotationType: AnnotationType, objectClasses: ObjectClassBase[]) {
    super(annotationType, objectClasses);
  }

  // override set objectClasses(value: ObjectClassBase[]){
  //   this._objectClasses = value;
  // }
}

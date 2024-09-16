import {AnnotationType} from "./enum/annotation-type";
import {ObjectClassBase} from "./object-class-base";

export class ProjectSetupBase {
  protected _annotationType: AnnotationType;
  protected _objectClasses: ObjectClassBase[];

  constructor(annotationType: AnnotationType, objectClasses: ObjectClassBase[]) {
    this._annotationType = annotationType;
    this._objectClasses = objectClasses;
  }

  get annotationType(): AnnotationType {
    return this._annotationType;
  }

  get objectClasses(): ObjectClassBase[] {
    return this._objectClasses;
  }
}

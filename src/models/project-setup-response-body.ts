import {ObjectClassResponseBody} from "./object-class-response-body";
import {AnnotationType} from "./enum/annotation-type";

export class ProjectSetupResponseBody {
  private readonly _setupId: string;
  private readonly _annotationType: AnnotationType
  private readonly _objectClasses: ObjectClassResponseBody[];

  constructor(setupId: string, annotationType: AnnotationType, objectClasses: ObjectClassResponseBody[]) {
    this._setupId = setupId;
    this._annotationType = annotationType;
    this._objectClasses = objectClasses;
  }

  get setupId(): string {
    return this._setupId;
  }

  get annotationType(): AnnotationType {
    return this._annotationType;
  }

  get objectClasses(): ObjectClassResponseBody[] {
    return this._objectClasses;
  }
}

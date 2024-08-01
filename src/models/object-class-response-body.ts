import {ObjectClassBase} from "./object-class-base";

export class ObjectClassResponseBody extends ObjectClassBase{
  private readonly _classId: string;

  constructor(classId: string, className: string, color: string, description?: string) {
    super(className, color, description);
    this._classId = classId;
  }

  get classId(): string {
    return this._classId;
  }
}

import {ObjectClassBase} from "./object-class-base";

export class ObjectClassResponseBody extends ObjectClassBase{
  private readonly _classId: string
  private readonly _classIndex: number;

  constructor(classId: string, className: string, classIndex: number, color: string, description?: string) {
    super(className, color, description);
    this._classId = classId;
    this._classIndex = classIndex;
  }

  get classId(): string {
    return this._classId;
  }

  get classIndex(): number {
    return this._classIndex;
  }
}

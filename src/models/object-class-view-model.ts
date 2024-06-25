export class ObjectClassViewModel {
  private readonly _classId: string;
  private readonly _className: string;
  private readonly _color: string;
  private _selected: boolean = false;

  constructor(classId: string, className: string, color: string) {
    this._classId = classId;
    this._className = className;
    this._color = color;
  }

  get classId(): string {
    return this._classId;
  }

  get className(): string {
    return this._className;
  }


  get color(): string {
    return this._color;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }
}

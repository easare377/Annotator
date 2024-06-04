/**
 * ViewModel for representing an object class.
 */
export class ObjectClassViewModel {
  private readonly _classId: string; // Unique identifier for the class
  private readonly _className: string; // Name of the class
  private readonly _color: string; // Color associated with the class
  private _selected: boolean = false; // Flag indicating whether the class is selected

  /**
   * Initializes a new instance of the ObjectClassViewModel class.
   * @param classId Unique identifier for the class.
   * @param className Name of the class.
   * @param color Color associated with the class.
   */
  constructor(classId: string, className: string, color: string) {
    this._classId = classId;
    this._className = className;
    this._color = color;
  }

  /**
   * Gets the unique identifier of the class.
   * @returns The unique identifier of the class.
   */
  get classId(): string {
    return this._classId;
  }

  /**
   * Gets the name of the class.
   * @returns The name of the class.
   */
  get className(): string {
    return this._className;
  }

  /**
   * Gets the color associated with the class.
   * @returns The color associated with the class.
   */
  get color(): string {
    return this._color;
  }

  /**
   * Gets a value indicating whether the class is selected.
   * @returns True if the class is selected; otherwise, false.
   */
  get selected(): boolean {
    return this._selected;
  }

  /**
   * Sets a value indicating whether the class is selected.
   * @param value True if the class is selected; otherwise, false.
   */
  set selected(value: boolean) {
    this._selected = value;
  }
}


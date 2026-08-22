import {ObjectClassBase} from "./object-class-base";

/**
 * ViewModel for representing an object class.
 */
export class ObjectClassViewModel extends ObjectClassBase{
  private readonly _classId: string; // Unique identifier for the class
  private _selected: boolean = false; // Flag indicating whether the class is selected

  /**
   * Initializes a new instance of the ObjectClassViewModel class.
   * @param classId Unique identifier for the class.
   * @param className Name of the class.
   * @param color Color associated with the class.
   * @param description Detailed description of the class.
   */
  constructor(classId: string, className: string, color: string,  description?: string) {
    super(className, color, description);
    this._classId = classId;
  }

  /**
   * Gets the unique identifier of the class.
   * @returns The unique identifier of the class.
   */
  get classId(): string {
    return this._classId;
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


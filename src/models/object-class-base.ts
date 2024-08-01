export class ObjectClassBase {
  private readonly _className: string; // Name of the class
  private readonly _color: string; // Color associated with the class
  private _description: string | undefined;

  constructor(className: string, color: string, description?: string) {
    this._className = className;
    this._color = color;
    this._description = description;
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


  get description(): string | undefined {
    return this._description;
  }

  set description(value: string | undefined) {
    this._description = value;
  }
}

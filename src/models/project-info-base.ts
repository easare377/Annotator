export abstract class ProjectInfoBase {
  private _name: string;
  private _description: string | null;

  protected constructor(_name: string, description: string | null) {
    this._name = _name;
    this._description = description;
  }


  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string | null {
    return this._description;
  }

  set description(value: string | null) {
    this._description = value;
  }
}

export abstract class ProjectInfoBase {
  private _name: string;
  private _description: string | undefined;

  protected constructor(_name: string, description: string | undefined) {
    this._name = _name;
    this._description = description;
  }


  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(value: string | undefined) {
    this._description = value;
  }
}

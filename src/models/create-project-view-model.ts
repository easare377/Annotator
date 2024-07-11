import {ProjectInfoBase} from "./project-info-base";
import {ProjectSetupBase} from "./project-setup-base";

export class CreateProjectViewModel extends ProjectInfoBase {
  // protected override _name: string;
  // private _projectSetup: ProjectSetupBase | undefined;

  constructor(name: string, description?: string, projectSetup?: ProjectSetupBase) {
    super(name, description);
    // this._name = name
    // this._projectSetup = projectSetup;
  }


  // override set name(value: string) {
  //   super._name = value;
  // }

  // get projectSetup(): ProjectSetupBase | undefined {
  //   return this._projectSetup;
  // }
  //
  // set projectSetup(value: ProjectSetupBase | undefined) {
  //   this._projectSetup = value;
  // }
}

import {RequestBody} from "./request-body";

export class ObjectClassInfosRequestBody extends RequestBody{
  private readonly _objectClasses: Array<{polygonId: string, classId: string}> = [];

  constructor() {
    super();
  }

  addObjectClassInfo(polygonId: string, classId: string){
    this._objectClasses.push({polygonId, classId});
  }

  get objectClasses(): Array<{ polygonId: string; classId: string }> {
    return this._objectClasses;
  }
}

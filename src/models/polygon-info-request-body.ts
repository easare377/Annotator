import { Prompts } from "./prompts";
import {RequestBody} from "./request-body";

export class PolygonInfoRequestBody extends RequestBody{
  private readonly _imageId: string;
  private readonly _prompts: Prompts | undefined;

  constructor(imageId: string, prompts?: Prompts) {
    super();
    this._imageId = imageId;
    this._prompts = prompts;
  }


  get imageId(): string {
    return this._imageId;
  }

  get prompts(): Prompts | undefined {
    return this._prompts;
  }
}

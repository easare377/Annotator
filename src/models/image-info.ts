import {Size} from "./size";
import {PolygonViewModel} from "./polygon-view-model";

export class ImageInfo {
  private readonly _imageUrl: string;
  private readonly _trueSize: Size;
  private _scaledSize: Size;
  private _polygonVms: PolygonViewModel[] | undefined;


  constructor(imageUrl: string, trueSize: Size) {
    this._imageUrl = imageUrl;
    this._trueSize = trueSize;
    this._scaledSize = trueSize;
    // this._polygonVms = polygonVms;
  }


  get imageUrl(): string {
    return this._imageUrl;
  }

  get trueSize(): Size {
    return this._trueSize;
  }


  get scaledSize(): Size {
    return this._scaledSize;
  }

  set scaledSize(value: Size) {
    this._scaledSize = value;
  }


  get polygonVms(): PolygonViewModel[] | undefined {
    return this._polygonVms;
  }

  set polygonVms(value: PolygonViewModel[] | undefined) {
    this._polygonVms = value;
  }
}

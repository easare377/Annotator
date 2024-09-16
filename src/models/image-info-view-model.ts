import {Size} from "./size";
import {PolygonViewModel} from "./polygon-view-model";

export class ImageInfoViewModel {
  private readonly _imageId: string;
  private readonly _imageUrl: string;
  private readonly _imageSize: Size;
  private readonly _dateAdded: Date;
  private readonly _dateModified: Date;
  private readonly _originalFileName: string;
  private _scaledSize: Size;
  private _zoomLevel: number = 100;
  private _polygonVms: PolygonViewModel[] | undefined;
  private readonly _annotatedPolygonVms: PolygonViewModel[] = [];
  public onPolygonsChanged: Function | undefined;


  constructor(imageId: string, imageUrl: string, trueSize: Size, originalFileName: string, dateAdded: Date, dateModified: Date) {
    this._imageId = imageId;
    this._imageUrl = imageUrl;
    this._imageSize = trueSize;
    this._scaledSize = trueSize;
    this._originalFileName = originalFileName;
    this._dateAdded = dateAdded;
    this._dateModified = dateModified;
    // this._polygonVms = polygonVms;
  }

  get imageId(): string {
    return this._imageId;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get imageSize(): Size {
    return this._imageSize;
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
    if (this.onPolygonsChanged) {
      this.onPolygonsChanged();
    }
  }


  get annotatedPolygonVms(): PolygonViewModel[] {
    return this._annotatedPolygonVms;
  }


  get zoomLevel(): number {
    return this._zoomLevel;
  }

  set zoomLevel(value: number) {
    this._zoomLevel = value;
  }


  get dateAdded(): Date {
    return this._dateAdded;
  }

  get dateModified(): Date {
    return this._dateModified;
  }


  get originalFileName(): string {
    return this._originalFileName;
  }
}

import {Size} from "./size";

export abstract class ImageInfoBase {
  private readonly _imageId: string;
  private readonly _imageUrl: string;
  private readonly _imageSize: Size;


  protected constructor(imageId: string, imageUrl: string, imageSize: Size) {
    this._imageId = imageId;
    this._imageUrl = imageUrl;
    this._imageSize = imageSize;
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
}

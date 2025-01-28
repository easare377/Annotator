import {Size} from "./size";
import {ImageUrls} from "./image-urls";

export abstract class ImageInfoBase {
  private readonly _imageId: string;
  private readonly _imageUrls: ImageUrls;
  private readonly _imageSize: Size;


  protected constructor(imageId: string, imageUrls: ImageUrls, imageSize: Size) {
    this._imageId = imageId;
    this._imageUrls = imageUrls;
    this._imageSize = imageSize;
  }


  get imageId(): string {
    return this._imageId;
  }

  get imageUrls(): ImageUrls {
    return this._imageUrls;
  }

  get imageSize(): Size {
    return this._imageSize;
  }
}

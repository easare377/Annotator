import {Size} from "./size";
import {ImageInfoBase} from "./image-info-base";

export class ImageInfoResponseBody extends ImageInfoBase{
  private readonly _originalFileName: string;
  private readonly _dateAdded: Date;
  private readonly _dateModified: Date;


  constructor(imageId: string, imageUrl: string, imageSize: Size, originalFileName: string, dateAdded: Date, dateModified: Date) {
    super(imageId, imageUrl, imageSize);
    this._originalFileName = originalFileName;
    this._dateAdded = dateAdded;
    this._dateModified = dateModified;
  }


  get originalFileName(): string {
    return this._originalFileName;
  }

  get dateAdded(): Date {
    return this._dateAdded;
  }

  get dateModified(): Date {
    return this._dateModified;
  }
}

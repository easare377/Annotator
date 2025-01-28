export class ImageUrls {
  private readonly _png: string;
  private readonly _jpg: string;
  private readonly _thumb: string;

  constructor(_png: string, _jpg: string, _thumb: string) {
    this._png = _png;
    this._jpg = _jpg;
    this._thumb = _thumb;
  }


  get png(): string {
    return this._png;
  }

  get jpg(): string {
    return this._jpg;
  }

  get thumb(): string {
    return this._thumb;
  }
}

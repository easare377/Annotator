export class BBox {
  private readonly _xMin: number;
  private readonly _yMin: number;
  private readonly _xMax: number;
  private readonly _yMax: number;


  private constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
    this._xMin = xMin;
    this._yMin = yMin;
    this._xMax = xMax;
    this._yMax = yMax;
  }

  static fromBbox(xMin: number, yMin: number, xMax: number, yMax: number): BBox {
    return new BBox(xMin, yMin, xMax, yMax);
  }

  static fromRect(x: number, y: number, width: number, height:number): BBox {
    return new BBox(x, y, x + width, y + height);
  }


  get xMin(): number {
    return this._xMin;
  }

  get yMin(): number {
    return this._yMin;
  }

  get xMax(): number {
    return this._xMax;
  }

  get yMax(): number {
    return this._yMax;
  }

  getWidth(): number{
    return this.xMax - this.yMax;
  }

  getHeight(): number{
    return this._yMax - this.yMax;
  }
}

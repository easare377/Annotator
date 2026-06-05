import {ObjectClassViewModel} from "./object-class-view-model";
import {Point} from "./point";
import {BBox} from "./bbox";

export class PolygonViewModel {
  private readonly _id: string;
  private readonly _truePoints: Array<Point>;
  private _scaledPoints: Array<Point>;
  private readonly _bbox: BBox;
  // private _className: string | undefined;
  private _objectClassVm: ObjectClassViewModel | undefined
  private _color: string;
  private _mouseOver: boolean = false;
  private _dimmed: boolean = false;
  private _displayPath: Path2D;
  private _displayBbox: BBox;
  private readonly _area: number;
  private _displayArea: number;
  public onMouseOver: Function | undefined;
  public onClick: Function | undefined;
  public onClassSet: Function | undefined;
  public onDrawPolygon: Function | undefined;

  constructor(id: string, points: Array<Point>, color: string = '#FF0000FF') {
    this._id = id;
    this._truePoints = points;
    this._scaledPoints = points;
    this._displayPath = this.createPath(points);
    this._displayBbox = this.computeBbox(points);
    this._area = this.computeArea(points);
    this._displayArea = this._area;
    this._color = color;
    this._bbox = this.computeBbox(points);
  }

  get id(): string {
    return this._id;
  }

  get truePoints(): Array<Point> {
    return this._truePoints;
  }


  get scaledPoints(): Array<Point> {
    return this._scaledPoints;
  }

  set scaledPoints(value: Array<Point>) {
    this._scaledPoints = value;
    this._displayPath = this.createPath(value);
    this._displayBbox = this.computeBbox(value);
    this._displayArea = this.computeArea(value);
  }

  get displayPath(): Path2D {
    return this._displayPath;
  }

  get displayBbox(): BBox {
    return this._displayBbox;
  }

  get area(): number {
    return this._area;
  }

  get displayArea(): number {
    return this._displayArea;
  }

  get bbox(): BBox {
    return this._bbox;
  }

  get color(): string {
    return this._color;
  }


  set color(value: string) {
    this._color = value;
  }

  get objectClassVm(): ObjectClassViewModel | undefined {
    return this._objectClassVm;
  }

  set objectClassVm(value: ObjectClassViewModel | undefined) {
    this._objectClassVm = value;
    if (this.onClassSet){
      this.onClassSet();
    }
  }

  get mouseOver(): boolean {
    return this._mouseOver;
  }

  set mouseOver(value: boolean) {
    this._mouseOver = value;
  }

  get dimmed(): boolean {
    return this._dimmed;
  }

  set dimmed(value: boolean) {
    this._dimmed = value;
  }

  computeBbox(points: Array<Point>): BBox {
    let xMin: number = points[0].x;
    let xMax: number = points[0].x;
    let yMin: number = points[0].y;
    let yMax: number = points[0].y;
    points.forEach((point: Point) => {
      if (point.x < xMin) {
        xMin = point.x;
      }
      if (point.x > xMax) {
        xMax = point.x;
      }
      if (point.y < yMin) {
        yMin = point.y;
      }
      if (point.y > yMax) {
        yMax = point.y;
      }
    });
    return BBox.fromBbox(xMin, yMin, xMax, yMax);
  }

  private createPath(points: Array<Point>): Path2D {
    const path = new Path2D();
    if (!points.length) return path;
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point: Point) => path.lineTo(point.x, point.y));
    path.closePath();
    return path;
  }

  private computeArea(points: Array<Point>): number {
    if (points.length < 3) return 0;
    let area: number = 0;
    points.forEach((point: Point, index: number) => {
      const nextPoint: Point = points[(index + 1) % points.length];
      area += point.x * nextPoint.y - point.y * nextPoint.x;
    });
    return Math.abs(area) / 2;
  }

  drawPolygon(): void{
    if (this.onDrawPolygon){
      this.onDrawPolygon();
    }
  }
}

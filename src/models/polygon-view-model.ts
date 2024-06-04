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
  public onMouseOver: Function | undefined;
  public onClick: Function | undefined;
  public onClassSet: Function | undefined;

  constructor(id: string, points: Array<Point>, color: string = '#FF0000FF') {
    this._id = id;
    this._truePoints = points;
    this._scaledPoints = points;
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
}

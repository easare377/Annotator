import {ObjectClassViewModel} from "./object-class-view-model";

export class PolygonViewModel {
  private readonly _id: string;
  private readonly _points: Array<Array<number>>;
  // private _className: string | undefined;
  private _objectClassVm: ObjectClassViewModel | undefined
  private _color: string;
  private _mouseOver: boolean = false;
  public onMouseOver: Function | undefined;
  public onClick:Function | undefined;

  constructor(id: string,points: Array<Array<number>>, color: string = '#FF0000FF') {
    this._id = id;
    this._points = points;
    this._color = color;
  }

  get id(): string {
    return this._id;
  }

  get points(): Array<Array<number>> {
    return this._points;
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
  }

  get mouseOver(): boolean {
    return this._mouseOver;
  }

  set mouseOver(value: boolean) {
    this._mouseOver = value;
  }
}

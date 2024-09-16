import {Point} from "./point";

export class PolygonInfoResponseBody {
  private readonly _polygonId: string;
  private readonly _points: Point[];
  private readonly _stabilityScore: number;
  private readonly _predictedIoU: number;
  private readonly _dateCreated: Date;
  private readonly _dateModified: Date;
  private _classId: string | undefined;


  constructor(polygonId: string, points: Point[], stabilityScore: number, predictedIoU: number, dateCreated: Date,
              dateModified: Date, classId?: string) {
    this._polygonId = polygonId;
    this._points = points;
    this._stabilityScore = stabilityScore;
    this._predictedIoU = predictedIoU;
    this._dateCreated = dateCreated;
    this._dateModified = dateModified;
    this._classId = classId;
  }


  get polygonId(): string {
    return this._polygonId;
  }

  get points(): Point[] {
    return this._points;
  }

  get stabilityScore(): number {
    return this._stabilityScore;
  }

  get predictedIoU(): number {
    return this._predictedIoU;
  }

  get dateCreated(): Date {
    return this._dateCreated;
  }

  get dateModified(): Date {
    return this._dateModified;
  }


  get classId(): string | undefined {
    return this._classId;
  }

  set classId(value: string | undefined) {
    this._classId = value;
  }
}

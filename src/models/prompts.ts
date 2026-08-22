import { BBox } from "./bbox";
import { Point } from "./point";

export class Prompts{
    private readonly _positivePoints: Point[];
    private readonly _negativePoints: Point[];
    private readonly _bbox: BBox | undefined;

    constructor(positivePoints: Point[], negativePoints: Point[], bbox: BBox | undefined) {
        this._positivePoints = positivePoints;
        this._negativePoints = negativePoints;
        this._bbox = bbox;
    }

    get positivePoints(): Point[] {
        return this._positivePoints;
    }

    get negativePoints(): Point[] {
        return this._negativePoints;
    }

    get bbox(): BBox | undefined {
        return this._bbox;
    }
}

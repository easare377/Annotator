import { PointType } from "./enum/point-type";
import { Point } from "./point";

/**
 * View model that pairs a `Point` with its `PointType` for UI/display usage.
 *
 * This class is immutable: both `pointType` and `point` are read-only and
 * exposed via accessor properties to provide better IntelliSense and discoverability
 * when consumed by components or services.
 */
export class PointViewModel {
    /** The category/type of the point. */
    private readonly _pointType: PointType;

    /** The underlying point data. */
    private readonly _point: Point;

    /**
     * Create a new `PointViewModel`.
     * @param pointType - The type/classification of the point.
     * @param point - The `Point` instance containing coordinates and metadata.
     */
    constructor(pointType: PointType, point: Point) {
        this._pointType = pointType;
        this._point = point;
    }

    /** The `PointType` for this view model (read-only). */
    get pointType(): PointType {
        return this._pointType;
    }

    /** The `Point` instance wrapped by this view model (read-only). */
    get point(): Point {
        return this._point;
    }
}

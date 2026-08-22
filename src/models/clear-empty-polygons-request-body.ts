import { RequestBody } from "./request-body";

export class ClearEmptyPolygonsRequestBody extends RequestBody {
    private readonly _imageId: string;

    constructor(imageId: string) {
        super();
        this._imageId = imageId;
    }

    get imageId(): string {
        return this._imageId;
    }
}
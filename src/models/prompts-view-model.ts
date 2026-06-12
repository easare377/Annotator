import { BBox } from "./bbox";
import { PromptType } from "./enum/prompt-type";
import { PointViewModel } from "./point-view-model";

export class PromptsViewModel {
    private readonly _pointVms: PointViewModel[] = [];
    private readonly _bboxes: BBox[] = [];

    private _promptType: PromptType = PromptType.NONE;

    get pointVms(): PointViewModel[] {
        return this._pointVms;
    }

    get bboxes(): BBox[] {
        return this._bboxes;
    }

    get promptType(): PromptType {
        return this._promptType;
    }

}
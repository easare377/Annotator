import { BBox } from "./bbox";
import { PromptType } from "./enum/prompt-type";
import { PointViewModel } from "./point-view-model";

type PromptHistoryEntry =
    { kind: "point", value: PointViewModel } |
    { kind: "bbox", value: BBox };

export class PromptsViewModel {
    private readonly _pointVms: PointViewModel[] = [];
    private readonly _bboxes: BBox[] = [];
    private readonly _history: PromptHistoryEntry[] = [];
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

    set promptType(value: PromptType) {
        this._promptType = value;
    }

    get hasPrompts(): boolean {
        return this._pointVms.length > 0 || this._bboxes.length > 0;
    }

    addPoint(pointVm: PointViewModel): void {
        this._pointVms.push(pointVm);
        this._history.push({kind: "point", value: pointVm});
    }

    addBbox(bbox: BBox): void {
        this._bboxes.push(bbox);
        this._history.push({kind: "bbox", value: bbox});
    }

    undo(): void {
        const entry: PromptHistoryEntry | undefined = this._history.pop();
        if (!entry) return;
        if (entry.kind === "point") {
            const index: number = this._pointVms.indexOf(entry.value);
            if (index !== -1) {
                this._pointVms.splice(index, 1);
            }
            return;
        }
        const index: number = this._bboxes.indexOf(entry.value);
        if (index !== -1) {
            this._bboxes.splice(index, 1);
        }
    }

    clear(): void {
        this._pointVms.splice(0);
        this._bboxes.splice(0);
        this._history.splice(0);
    }
}

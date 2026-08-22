import { BBox } from "./bbox";
import { PointViewModel } from "./point-view-model";

type PromptHistoryEntry =
    { kind: "point", value: PointViewModel } |
    { kind: "bbox", value: BBox };

export class PromptsViewModel {
    private readonly _pointVms: PointViewModel[] = [];
    private _bbox: BBox | undefined;
    private readonly _history: PromptHistoryEntry[] = [];

    get pointVms(): PointViewModel[] {
        return this._pointVms;
    }

    get bbox(): BBox | undefined {
        return this._bbox;
    }

    get hasPrompts(): boolean {
        return this._pointVms.length > 0 || this._bbox !== undefined;
    }

    addPoint(pointVm: PointViewModel): void {
        this._pointVms.push(pointVm);
        this._history.push({kind: "point", value: pointVm});
    }

    addBbox(bbox: BBox): void {
        this._bbox = bbox;
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
        if (this._bbox === entry.value) {
            this._bbox = undefined;
        }
    }

    clear(): void {
        this._pointVms.splice(0);
        this._bbox = undefined;
        this._history.splice(0);
    }
}

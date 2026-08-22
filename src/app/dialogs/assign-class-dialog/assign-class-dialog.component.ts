import {Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren} from '@angular/core';
import {Dialog} from "../dialog";
import {ObjectClassViewModel} from "../../../models/object-class-view-model";
import {PolygonViewModel} from "../../../models/polygon-view-model";

@Component({
  selector: 'app-assign-class-dialog',
  templateUrl: './assign-class-dialog.component.html',
  styleUrls: ['./assign-class-dialog.component.css', '../dialog.css']
})
export class AssignClassDialogComponent extends Dialog {
  @Input() objectClassVms: Array<ObjectClassViewModel> = [];
  @Input() polygonVm: PolygonViewModel | undefined;
  @Output() objectClassSelected = new EventEmitter<ObjectClassViewModel | undefined>();
  @ViewChildren('classOption') classOptions!: QueryList<ElementRef<HTMLButtonElement>>;
  activeIndex: number = 0;

  constructor() {
    super();
  }

  override showDialog(): void {
    super.showDialog();
    this.activeIndex = 0;
    requestAnimationFrame(() => this.focusActiveOption());
  }

  get hasAssignedClass(): boolean {
    return !!this.polygonVm?.objectClassVm;
  }

  get clearOptionIndex(): number {
    return this.objectClassVms.length;
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActiveOption(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActiveOption(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActiveOption();
        break;
      case 'Escape':
        event.preventDefault();
        this.hideDialog();
        break;
    }
  }

  isSelectedClass(objectClassVm: ObjectClassViewModel): boolean {
    return this.polygonVm?.objectClassVm?.classId === objectClassVm.classId;
  }

  setClass(objectClassVm: ObjectClassViewModel | undefined): void {
    if (this.polygonVm) {
      this.objectClassSelected.emit(objectClassVm);
    }
    this.hideDialog();
  }

  trackByClassId(_index: number, objectClassVm: ObjectClassViewModel): string {
    return objectClassVm.classId;
  }

  private selectActiveOption(): void {
    if (this.activeIndex < this.objectClassVms.length) {
      this.setClass(this.objectClassVms[this.activeIndex]);
      return;
    }
    if (this.hasAssignedClass) {
      this.setClass(undefined);
    }
  }

  private moveActiveOption(direction: number): void {
    const totalOptions: number = this.objectClassVms.length + (this.hasAssignedClass ? 1 : 0);
    if (totalOptions === 0) return;
    this.activeIndex = (this.activeIndex + direction + totalOptions) % totalOptions;
    this.focusActiveOption();
  }

  private focusActiveOption(): void {
    this.classOptions?.get(this.activeIndex)?.nativeElement.focus();
  }
}

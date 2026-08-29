import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ObjectClassBase} from "../../../../models/object-class-base";
import {ProjectSetupViewModel} from "../../../../models/project-setup-view-model";
import {AnnotationType} from "../../../../models/enum/annotation-type";
import { Utils } from '../../../utils';

@Component({
  selector: 'app-labeling-setup',
  templateUrl: './labeling-setup.component.html',
  styleUrl: './labeling-setup.component.css'
})
export class LabelingSetupComponent {

  @Input() visible = false;
  @ViewChild('addedClasses') private addedClasses?: ElementRef<HTMLDivElement>;
  readonly maxObjectClasses = 255;
  color:string="white"
  newLabels: string = '';
  labels: { name: string, color: string }[] = [];
  public projectSetupVm: ProjectSetupViewModel
  // public objectClassVm: ObjectClassBase[] = [];

  constructor() {
    this.projectSetupVm = new ProjectSetupViewModel(AnnotationType.POLYGON, new Array<ObjectClassBase>());
  }

  addLabel(className: string, description: string): void{
    if (!this.canAddClassName(className)) {
      return;
    }

    const existingColors: string[] = this.projectSetupVm.objectClasses
      .map((objectClass: ObjectClassBase): string => objectClass.color);
    const color: string = Utils.generateDistinctColor(existingColors);
    const objectClassVm = new ObjectClassBase(className, color, description);
    this.projectSetupVm.objectClasses.push(objectClassVm);
    this.scrollToNewestClass();
  }

  onClassNameInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const originalValue: string = input.value;
    const selectionStart: number = input.selectionStart ?? originalValue.length;
    const sanitizedValue: string = this.sanitizeClassName(originalValue);

    input.value = sanitizedValue;

    if (sanitizedValue !== originalValue) {
      const sanitizedSelectionStart: number = this.sanitizeClassName(
        originalValue.slice(0, selectionStart)
      ).length;
      input.setSelectionRange(sanitizedSelectionStart, sanitizedSelectionStart);
    }
  }

  isValidClassName(className: string): boolean {
    return className.length > 0 && /^\p{L}[\p{L}\p{N}]*$/u.test(className);
  }

  isDuplicateClassName(className: string): boolean {
    const normalizedClassName: string = className.toLowerCase();
    return this.projectSetupVm.objectClasses.some(
      (objectClass: ObjectClassBase): boolean =>
        objectClass.className.toLowerCase() === normalizedClassName
    );
  }

  canAddClassName(className: string): boolean {
    return !this.hasReachedClassLimit
      && this.isValidClassName(className)
      && !this.isDuplicateClassName(className);
  }

  get hasReachedClassLimit(): boolean {
    return this.projectSetupVm.objectClasses.length >= this.maxObjectClasses;
  }

  removeLabel(objectClassVm: ObjectClassBase) {
    const indx = this.projectSetupVm.objectClasses.findIndex(obj => obj === objectClassVm);
    if (indx !== -1) {
      this.projectSetupVm.objectClasses.splice(indx, 1);
    }
  }

  // getRandomColor() {
  //   const letters = '0123456789ABCDEF';
  //   let color = '#';
  //   for (let i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }

  private sanitizeClassName(className: string): string {
    const sanitizedClassName: string = Array.from(className)
      .filter((character: string) => /^[\p{L}\p{N}]$/u.test(character))
      .join('');

    return sanitizedClassName.replace(/^\p{N}+/u, '');
  }

  private scrollToNewestClass(): void {
    setTimeout((): void => {
      const classList: HTMLDivElement | undefined = this.addedClasses?.nativeElement;
      classList?.scrollTo({
        top: classList.scrollHeight,
        behavior: 'smooth',
      });
    });
  }

}

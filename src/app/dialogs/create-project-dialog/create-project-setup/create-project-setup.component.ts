import {Component, Input} from '@angular/core';
import {CreateProjectViewModel} from "../../../../models/create-project-view-model";

@Component({
  selector: 'app-create-project-setup',
  templateUrl: './create-project-setup.component.html',
  styleUrls: ['./create-project-setup.component.css', '../create-project-dialog.component.css']
})
export class CreateProjectSetupComponent {
  @Input() visible = false;
  readonly projectNameMaxLength = 50;
  readonly descriptionMaxLength = 255;
  public createProjectVm: CreateProjectViewModel;

  constructor() {
    this.createProjectVm = new CreateProjectViewModel('', null);
  }

  get normalizedProjectName(): string {
    return this.createProjectVm.name.trim();
  }

  get descriptionLength(): number {
    return this.createProjectVm.description?.length ?? 0;
  }

  get projectNameError(): string | null {
    const projectName: string = this.normalizedProjectName;

    if (!projectName) {
      return 'Project name is required.';
    }
    if (projectName.length > this.projectNameMaxLength) {
      return `Project name cannot be more than ${this.projectNameMaxLength} characters.`;
    }
    if (!/[\p{L}\p{N}]/u.test(projectName)) {
      return 'Project name must contain at least one letter or number.';
    }
    if (/^\p{N}/u.test(projectName)) {
      return 'Project name cannot begin with a number.';
    }
    if (!/^[\p{L}\p{N} _-]+$/u.test(projectName)) {
      return 'Use only letters, numbers, spaces, hyphens, and underscores.';
    }

    return null;
  }

  get descriptionError(): string | null {
    if (this.descriptionLength > this.descriptionMaxLength) {
      return `Description cannot be more than ${this.descriptionMaxLength} characters.`;
    }

    return null;
  }

  get isValid(): boolean {
    return this.projectNameError === null && this.descriptionError === null;
  }

  onProjectNameInput(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const originalValue: string = input.value;
    const selectionStart: number = input.selectionStart ?? originalValue.length;
    const sanitizedValue: string = this.sanitizeProjectName(originalValue);

    input.value = sanitizedValue;
    this.createProjectVm.name = sanitizedValue;

    if (sanitizedValue !== originalValue) {
      const sanitizedSelectionStart: number = this.sanitizeProjectName(
        originalValue.slice(0, selectionStart)
      ).length;
      input.setSelectionRange(sanitizedSelectionStart, sanitizedSelectionStart);
    }
  }

  normalizeProjectName(): void {
    this.createProjectVm.name = this.normalizedProjectName;
  }

  private sanitizeProjectName(projectName: string): string {
    const sanitizedProjectName: string = Array.from(projectName)
      .filter((character: string) => /^[\p{L}\p{N} _-]$/u.test(character))
      .join('');

    return sanitizedProjectName.replace(/^( *)\p{N}+/u, '$1');
  }
}

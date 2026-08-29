import {Component, Input} from '@angular/core';

import {ObjectClassResponseBody} from '../../../models/object-class-response-body';
import {ProjectInfoResponseBody} from '../../../models/project-info-response-body';
import {Dialog} from '../dialog';

type ProjectSettingsSection = 'general' | 'annotation' | 'classes' | 'danger';

@Component({
  selector: 'app-project-settings-dialog',
  templateUrl: './project-settings-dialog.component.html',
  styleUrls: ['./project-settings-dialog.component.css', '../dialog.css']
})
export class ProjectSettingsDialogComponent extends Dialog {
  @Input() projectInfo: ProjectInfoResponseBody | undefined;
  @Input() objectClasses: ObjectClassResponseBody[] = [];

  activeSection: ProjectSettingsSection = 'general';

  selectSection(section: ProjectSettingsSection): void {
    this.activeSection = section;
  }

  get projectInitials(): string {
    const words: string[] = (this.projectInfo?.name ?? 'Project')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return words.slice(0, 2).map((word: string) => word[0].toUpperCase()).join('');
  }

  get projectDescription(): string {
    return this.projectInfo?.description ?? '';
  }

  trackObjectClass(_: number, objectClass: ObjectClassResponseBody): string {
    return objectClass.classId;
  }
}

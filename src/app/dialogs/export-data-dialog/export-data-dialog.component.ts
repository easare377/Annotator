import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Dialog} from "../dialog";
import {ObjectClassResponseBody} from "../../../models/object-class-response-body";
import {ExportType} from "../../../models/enum/export-type";

@Component({
  selector: 'app-export-data-dialog',
  templateUrl: './export-data-dialog.component.html',
  styleUrls: ['./export-data-dialog.component.css', '../dialog.css']
})
export class ExportDataDialogComponent extends Dialog{
  @Input() projectId!: string;
  @Input() objectClasses!: ObjectClassResponseBody[]
  @Output() onExportData = new EventEmitter<ExportType>();
  protected readonly ExportType = ExportType;
}

import {Component, Input, OnInit} from '@angular/core';
import {IDialog} from "../i-dialog";
import {HttpResponse} from "@angular/common/http";
import {ExportDataRequestBody} from "../../../models/export-data-request-body";
import {Utils} from "../../utils";
import {ObjectClassResponseBody} from "../../../models/object-class-response-body";
import {HttpService} from "../../../services/http.service";
import {ExportType} from "../../../models/enum/export-type";


@Component({
  selector: 'app-export-data-progress-dialog',
  templateUrl: './export-data-progress-dialog.component.html',
  styleUrl: './export-data-progress-dialog.component.css'
})

export class ExportDataProgressDialogComponent implements OnInit, IDialog {

  @Input() objectClasses: ObjectClassResponseBody[] = []
  @Input() projectId!: string;

  // progressText!: string;
  visible: boolean = false;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
  }

  hideDialog(): void {
    this.visible = false;
  }

  showDialog(): void {
    this.visible = true;
    // this.exportDataAsync(this.projectId).then();
  }

  async exportDataAsync(projectId: string, exportType: ExportType): Promise<void> {
    try {
      const classValueDict = new Array<{ classId: string; classValue: number }>;
      this.objectClasses.forEach(objectClass => {
        // classValueDict.set(objectClass.classId, objectClass.classIndex);
        classValueDict.push({classId: objectClass.classId, classValue: objectClass.classIndex});
      });
      let resp: HttpResponse<string>;
      switch (exportType) {
        case ExportType.JSON:
          resp = await this.httpService.exportProjectAsJsonAsync(new ExportDataRequestBody(projectId, classValueDict));
          break;
        case ExportType.SEGMENTATION_MASK:
          resp = await this.httpService.exportProjectMaskAsync(new ExportDataRequestBody(projectId, classValueDict));
          break;
        case ExportType.YOLO:
          resp = await this.httpService.exportProjectMaskAsync(new ExportDataRequestBody(projectId, classValueDict));
          break;
        case ExportType.PASCAL_VOC:
          resp = await this.httpService.exportProjectAsVocAsync(new ExportDataRequestBody(projectId, classValueDict));
          break;
        // default:
        //   resp = await this.httpService.exportProjectAsync(new ExportDataRequestBody(projectId, classValueDict));
        //   break;
      }
      // const resp: HttpResponse<string> =
      //   await this.httpService.exportProjectAsync(new ExportDataRequestBody(projectId, classValueDict));
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          const zipUrl: string = resp.body;
          this.downloadFile(zipUrl);
          this.hideDialog();
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }

  downloadFile(url: string) {
    const filename: string = Utils.getFilenameFromUrl(url);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename); // Set the filename for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

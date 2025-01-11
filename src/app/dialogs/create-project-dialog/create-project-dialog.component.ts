import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ActiveTab} from "../../../models/enum/active-tab";
import {Dialog} from "../dialog";
import {CreateProjectViewModel} from "../../../models/create-project-view-model";
import {ProjectSetupViewModel} from "../../../models/project-setup-view-model";
import {HttpService} from "../../../services/http.service";
import {ProjectInfoRequestBody} from "../../../models/project-info-request-body";
import {ProjectSetupBase} from "../../../models/project-setup-base";
import {AnnotationType} from "../../../models/enum/annotation-type";
import {ObjectClassBase} from "../../../models/object-class-base";
import { HttpResponse } from "@angular/common/http";
import {ProjectInfoResponseBody} from "../../../models/project-info-response-body";
import {FileUploadService} from "../../file-upload.service";
import {CreatedProjectResponseBody} from "../../../models/created-project-response-body";

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.css', '../dialog.css']
})
export class CreateProjectDialogComponent extends Dialog implements OnInit {

  step: number = 1;
  maxSteps: number = 2;
  // files: File[] = [];

  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef;
  @Output() projectCreated = new EventEmitter<ProjectInfoResponseBody>();

  // selectedFiles?: FileList;
  // progress = 0;
  // message = '';

  constructor(private httpService: HttpService, private uploadService: FileUploadService) {
    super();
    // this.createProjectVm = new CreateProjectViewModel('', null);
  }

  // onFileSelected(event: any): void {
  //   this.selectedFiles = event.target.files;
  // }

  // upload(): void {
  //   if (this.selectedFiles) {
  //     this.uploadService.upload(this.selectedFiles).subscribe(
  //       event => {
  //         if (typeof event === 'object') {
  //           if (event.status === 'progress') {
  //             this.progress = event.message;
  //           } else {
  //             this.message = 'Upload complete';
  //           }
  //         }
  //       },
  //       error => {
  //         this.message = 'Could not upload the file';
  //         this.progress = 0;
  //       }
  //     );
  //   }
  // }

  ngOnInit(): void {
  }

  // setActiveTab(tab: ActiveTab): void {
  //   this.activeTab = tab;
  // }

  // onDragOver(event: DragEvent): void {
  //   event.preventDefault();
  // }

  // onDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   if (event.dataTransfer?.files) {
  //     Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
  //   }
  // }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files) {
  //     Array.from(input.files).forEach(file => this.files.push(file));
  //   }
  // }

  // triggerFileInput(): void {
  //   this.fileInput.nativeElement.click();
  // }

  async createProject(createProjectVm: CreateProjectViewModel, projectSetupVm: ProjectSetupViewModel):
    Promise<void> {
    const projectName: string = createProjectVm.name;
    const description: string | null = createProjectVm.description;
    const annotationType: AnnotationType | undefined = projectSetupVm.annotationType
    // const objectClasses: ObjectClassBase[] = [];
    // projectSetupVm.objectClasses
    const projectSetup = new ProjectSetupBase(AnnotationType.POLYGON, projectSetupVm.objectClasses)
    const projectInfoRequestBody =
      new ProjectInfoRequestBody(projectName, projectSetup, description);
    try {
      const resp: HttpResponse<ProjectInfoResponseBody>
        = await this.httpService.createProjectAsync(projectInfoRequestBody);
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          this.projectCreated.emit(resp.body);
          this.hideDialog();
          break;
        default:
          break;
      }
    }catch (e){

    }
  }
}

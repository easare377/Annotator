import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpService} from "../../services/http.service";
import {ImageInfoRequestBody} from "../../models/imageInfo-request-body";
import {HttpResponse} from "@angular/common/http";
import {ImageInfoResponseBody} from "../../models/image-info-response-body";
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {Size} from "../../models/size";
import {AppManagerService} from "../../services/app-manager.service";
import {BaseComponent} from "../base-component";
import {NavigationService} from "../../services/navigation.service";
import {ProjectDataResponseBody} from "../../models/project-data-response-body";

@Component({
  selector: 'app-project-images',
  templateUrl: './project-images.component.html',
  styleUrl: './project-images.component.css'
})
export class ProjectImagesComponent extends BaseComponent implements OnInit {
  projectId!: string;
  imageInfoVms: ImageInfoViewModel[] = new Array<ImageInfoViewModel>;

  constructor(private httpService: HttpService, private route: ActivatedRoute,
              private appManagerService: AppManagerService, private navService: NavigationService) {
    super();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      this.projectId = params['pid'];
      if (!this.projectId){
        await this.navService.gotoProjectPageAsync();
      }else{
        await this.getProjectDataAsync(this.projectId);
      }
    });
    // this.projectId = this.appManagerService.getData('projectId');
    //   if (this.projectId)
    //     this.getProjectDataAsync(this.projectId).then();
  }

  async getProjectDataAsync(projectId: string): Promise<void> {
    try {
      const resp: HttpResponse<ProjectDataResponseBody> =
        await this.httpService.getProjectDataAsync(new ImageInfoRequestBody(projectId))
      console.log(resp);
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          const imageInfosRespBody: Array<ImageInfoResponseBody> = resp.body.imageInfos;
          imageInfosRespBody.forEach(imageInfoRespBody => {
            this.createImageInfo(imageInfoRespBody);
          })
          break;
        case 409:
          break;
        case 500:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }

  createImageInfo(projectRespBody: ImageInfoResponseBody): void {
    const imageId: string = projectRespBody.imageId;
    const imageUrl: string = projectRespBody.imageUrl;
    const originalFilename: string = projectRespBody.originalFileName
    const imageSize: Size = projectRespBody.imageSize;
    const dateAdded: Date = projectRespBody.dateAdded;
    const dateModified: Date = projectRespBody.dateModified;
    const imageInfoVm =
      new ImageInfoViewModel(imageId, imageUrl, imageSize, originalFilename, dateAdded, dateModified);
    this.imageInfoVms.push(imageInfoVm);
  }
}

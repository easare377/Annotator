import {Component, Input, OnInit} from '@angular/core';
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {Point} from "../../models/point";
import {Utils} from "../utils";
import {PolygonViewModel} from "../../models/polygon-view-model";
import {HttpService} from "../../services/http.service";
import {ObjectClassViewModel} from "../../models/object-class-view-model";
import {AppManagerService} from "../../services/app-manager.service";
import {NavigationService} from "../../services/navigation.service";
import {HttpResponse} from "@angular/common/http";
import {ImageInfoResponseBody} from "../../models/image-info-response-body";
import {ImageInfoRequestBody} from "../../models/imageInfo-request-body";
import {Size} from "../../models/size";
import {ActivatedRoute} from "@angular/router";
import {ProjectDataResponseBody} from "../../models/project-data-response-body";
import {ObjectClassResponseBody} from "../../models/object-class-response-body";
import {PolygonInfoResponseBody} from "../../models/polygon-info-response-body";
import {PolygonInfoRequestBody} from "../../models/polygon-info-request-body";
import {UploadState} from "../../models/enum/upload-state";

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.css'
})
export class AnnotateComponent implements OnInit {
  public projectId!: string;
  public imageInfoVms: ImageInfoViewModel[];
  public currentImageInfo: ImageInfoViewModel | undefined;
  public currentObjectClassVm: ObjectClassViewModel | undefined;
  public generatingPolygons = false;
  @Input() objectClassVms!: Array<ObjectClassViewModel>;


  constructor(public httpService: HttpService, public navService: NavigationService,
              public appManagerService: AppManagerService, private route: ActivatedRoute) {
    // super(httpService, navService,appManagerService);
    this.imageInfoVms = [];
    this.objectClassVms = new Array<ObjectClassViewModel>();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      this.projectId = params['pid'];
      const currentImageId = params['imid'];
      if (!this.projectId) {
        await this.navService.gotoProjectPageAsync();
      } else {
        await this.getProjectDataAsync(this.projectId);
        this.currentImageInfo = this.imageInfoVms.find(image => image.imageId === currentImageId);
        const polygonsRespBody: PolygonInfoResponseBody[] = await this.getImagePolygonsAsync(currentImageId);
        const polygonVms: PolygonViewModel[] = [];
        if (polygonsRespBody.length > 0) {
          this.createPolygonVms(polygonsRespBody);
        }
      }
    });
  }



  createPolygonVms(polygonsRespBody: PolygonInfoResponseBody[]): void{
    const polygonVms: PolygonViewModel[] = [];
    polygonsRespBody.forEach(polygonRspBody => {
      const polygonId: string = polygonRspBody.polygonId;
      const points = polygonRspBody.points;
      polygonVms.push(new PolygonViewModel(polygonId, points, Utils.generateRandomColor()))
    });
    this.currentImageInfo!.polygonVms = polygonVms;
  }

  async generatePolygonsAsync(imageId: string): Promise<void> {
    this.generatingPolygons = true;
    const resp: HttpResponse<PolygonInfoResponseBody[]> =
      await this.httpService.generateImagePolygons(new PolygonInfoRequestBody(imageId));
    switch (resp.status) {
      case 200:
        if (!resp.body) {
          throw new Error();
        }
        // Display classes
        this.createPolygonVms(resp.body);
        break;
      default:
        this.generatingPolygons = false;
        throw new Error();
    }
    this.generatingPolygons = false;
  }

  async getImagePolygonsAsync(imageId: string): Promise<PolygonInfoResponseBody[]> {
      const resp: HttpResponse<PolygonInfoResponseBody[]> =
        await this.httpService.getImagePolygons(new PolygonInfoRequestBody(imageId));
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          // Display classes
          return resp.body;
        default:
          throw new Error();
      }
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
          const objectClassesRespBody: ObjectClassResponseBody[] = resp.body.projectSetup.objectClasses
          const imageInfosRespBody: Array<ImageInfoResponseBody> = resp.body.imageInfos;
          // Display classes
          objectClassesRespBody.forEach(objectClass => {
            this.createObjectClass(objectClass);
          })
          // Display images
          imageInfosRespBody.forEach(imageInfoRespBody => {
            this.createImageInfo(imageInfoRespBody);
          })
          break;
        default:
          throw new Error();
      }
    } catch (e) {
      console.log(e);
    }
  }

  createObjectClass(objectClass: ObjectClassResponseBody) {
    const classId: string = objectClass.classId;
    const className: string = objectClass.className;
    const color: string = objectClass.color;
    const description: string | undefined = objectClass.description;
    const objectClassVm =
      new ObjectClassViewModel(classId, className, color, description);
    this.objectClassVms.push(objectClassVm);
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

  async getPolygonDataAsync(dataUrl: string): Promise<PolygonViewModel[]> {
    const multiPoints: number[][][] = await this.httpService.getJsonDataAsync(dataUrl);
    let polygonVms: PolygonViewModel[] = [];
    if (multiPoints) {
      multiPoints.forEach((polygonPoints: number[][]) => {
        const points: Array<Point> = polygonPoints.map(point => new Point(point[0], point[1]));
        const color: string = Utils.generateRandomColor();
        const polygonVm = new PolygonViewModel(Utils.generateUUID(), points, color);
        // const polygonVm = this.createPolygonVms(canvas, points, <ImageInfo>this.imageInfo, color);
        polygonVms.push(polygonVm);
      });
      polygonVms = Utils.sortPolygonsByArea(polygonVms);
      // this.currentImageInfo.polygonVms = polygonVms;
    }
    return polygonVms;
  }

  getAnnotatedPolygon(polygonVms: PolygonViewModel[]): { index: number, polygonVm: PolygonViewModel }[] {
    let annotatedPolygonIndex = 0;
    const annotatedPolygonVms: { index: number, polygonVm: PolygonViewModel }[] = [];
    for (let i = 0; i < polygonVms.length; i++) {
      const polygonVm = polygonVms[i];
      if (polygonVm.objectClassVm) {
        annotatedPolygonIndex++;
        annotatedPolygonVms.push({index: annotatedPolygonIndex, polygonVm: polygonVm})
      }
    }
    return annotatedPolygonVms;
  }

  protected readonly UploadState = UploadState;
}

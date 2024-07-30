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

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.css'
})
export class AnnotateComponent implements OnInit{
  public projectId!: string;
  public imageInfoVms: ImageInfoViewModel[];
  public currentImageInfo: ImageInfoViewModel | undefined;
  public currentObjectClassVm: ObjectClassViewModel | undefined;
  @Input() objectClassVms!: Array<ObjectClassViewModel>;


  constructor(public httpService: HttpService, public navService: NavigationService,
              public appManagerService: AppManagerService, private route: ActivatedRoute) {
    // super(httpService, navService,appManagerService);
    this.imageInfoVms = [];
    const colors: string[] = ['#E91E63', '#FFBB86', '#000187', '#8A2BE2'];
    // colors[0] = Utils.lightenColor(colors[0], 0.3);
    this.objectClassVms = new Array<ObjectClassViewModel>();
    this.objectClassVms.push(new ObjectClassViewModel('', 'Tree', colors[0]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Charcoal', colors[1]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Road', colors[2]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Building', colors[3]));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      this.projectId = params['pid'];
      const currentImageId = params['imid'];
      if (!this.projectId){
        await this.navService.gotoProjectPageAsync();
      }else{
        await this.getProjectDataAsync(this.projectId);
        this.currentImageInfo = this.imageInfoVms.find(image => image.imageId === currentImageId);
      }
    });
  }

  async getProjectDataAsync(projectId: string): Promise<void> {
    try {
      const resp: HttpResponse<ImageInfoResponseBody[]> =
        await this.httpService.getImageInfosAsync(new ImageInfoRequestBody(projectId))
      console.log(resp);
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          const imageInfosRespBody: Array<ImageInfoResponseBody> = resp.body;
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

  getAnnotatedPolygon(polygonVms: PolygonViewModel[]): {index:number, polygonVm: PolygonViewModel}[] {
    let annotatedPolygonIndex = 0;
    const annotatedPolygonVms: {index:number, polygonVm: PolygonViewModel}[] = [];
    for (let i = 0; i < polygonVms.length; i++) {
      const polygonVm = polygonVms[i];
      if (polygonVm.objectClassVm){
        annotatedPolygonIndex++;
        annotatedPolygonVms.push({index:annotatedPolygonIndex, polygonVm:polygonVm})
      }
    }
    return annotatedPolygonVms;
  }
}

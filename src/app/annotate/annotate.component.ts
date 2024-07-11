import {Component, Input, OnInit} from '@angular/core';
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {Point} from "../../models/point";
import {Utils} from "../utils";
import {PolygonViewModel} from "../../models/polygon-view-model";
import {HttpService} from "../../services/http.service";
import {ObjectClassViewModel} from "../../models/object-class-view-model";
import {AppManagerService} from "../../services/app-manager.service";
import {NavigationService} from "../../services/navigation.service";

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.css'
})
export class AnnotateComponent implements OnInit{
  public imageInfos: ImageInfoViewModel[] | undefined;
  public currentImageInfo: ImageInfoViewModel | undefined;
  public currentObjectClassVm: ObjectClassViewModel | undefined;
  @Input() objectClassVms!: Array<ObjectClassViewModel>;


  constructor(public httpService: HttpService, public navService: NavigationService,
              public appManagerService: AppManagerService) {
    // super(httpService, navService,appManagerService);
    this.imageInfos = [];
    const colors: string[] = ['#E91E63', '#FFBB86', '#000187', '#8A2BE2'];
    // colors[0] = Utils.lightenColor(colors[0], 0.3);
    this.objectClassVms = new Array<ObjectClassViewModel>();
    this.objectClassVms.push(new ObjectClassViewModel('', 'Tree', colors[0]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Charcoal', colors[1]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Road', colors[2]));
    this.objectClassVms.push(new ObjectClassViewModel('', 'Building', colors[3]));
  }

  ngOnInit(): void {
    //
    // const imageInfo = new ImageInfoViewModel('http://localhost:4200/assets/images/Fort.jpg',
    //   new Size(3830, 1822),'image.jpg', new Date(), new Date());
    // const imageInfo2 = new ImageInfoViewModel('http://localhost:4200/assets/images/DJI_0195_AS_0320_01.JPG',
    //   new Size(4000, 2250),'image.jpg', new Date(), new Date());
    // const imageInfo3 = new ImageInfoViewModel('http://localhost:4200/assets/images/DJI_0183_AS_0320_03.JPG',
    //   new Size(4000, 2250),'image.jpg', new Date(), new Date());
    // const imageInfo4 = new ImageInfoViewModel('http://localhost:4200/assets/images/DJI_0198_AS_0320_01.JPG',
    //   new Size(4000, 2250), 'image.jpg', new Date(), new Date());
    // if (this.imageInfos){
    //   this.imageInfos.push(imageInfo);
    //   this.imageInfos.push(imageInfo2);
    //   this.imageInfos.push(imageInfo3);
    //   this.imageInfos.push(imageInfo4);
    //   this.currentImageInfo = imageInfo;
    // }
    // this.getPolygonDataAsync('assets/data/polygons.json').then((polygonVms)=>{
    //   imageInfo.polygonVms = polygonVms;
    // });
    // this.getPolygonDataAsync('assets/data/DJI_0194_AS_0320_01.json').then((polygonVms)=>{
    //   imageInfo2.polygonVms = polygonVms;
    // });
    // this.getPolygonDataAsync('assets/data/DJI_0183_AS_0320_03.json').then((polygonVms)=>{
    //   imageInfo3.polygonVms = polygonVms;
    // });
    // this.getPolygonDataAsync('assets/data/DJI_0198_AS_0320_01.json').then((polygonVms)=>{
    //   imageInfo4.polygonVms = polygonVms;
    // });
    // this.imageInfos.push(imageInfo);
    // this.imageInfos = this.appManagerService.imageInfoVms;
    // this.getPolygonDataAsync('assets/data/DJI_0198_AS_0320_01.json').then((polygonVms)=>{
    //   if (this.imageInfos){
    //     this.imageInfos[0].polygonVms = polygonVms;
    //   }
    // });
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

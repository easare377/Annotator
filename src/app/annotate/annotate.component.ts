import {Component, Input, OnInit} from '@angular/core';
import {ImageInfo} from "../../models/image-info";
import {Size} from "../../models/size";
import {Point} from "../../models/point";
import {Utils} from "../utils";
import {PolygonViewModel} from "../../models/polygon-view-model";
import {HttpService} from "../http.service";
import {ObjectClassViewModel} from "../../models/object-class-view-model";

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.css'
})
export class AnnotateComponent implements OnInit{
  public imageInfos: ImageInfo[] | undefined;
  public currentImageInfo: ImageInfo | undefined;
  public currentObjectClassVm: ObjectClassViewModel | undefined;
  @Input() objectClassVms!: Array<ObjectClassViewModel>;


  constructor(private httpService: HttpService) {
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

    const imageInfo = new ImageInfo('http://localhost:4200/assets/images/Fort.jpg', new Size(3830, 1822));
    const imageInfo2 = new ImageInfo('http://localhost:4200/assets/images/DJI_0195_AS_0320_01.JPG', new Size(4000, 2250));
    const imageInfo3 = new ImageInfo('http://localhost:4200/assets/images/DJI_0183_AS_0320_03.JPG', new Size(4000, 2250));
    if (this.imageInfos){
      this.imageInfos.push(imageInfo);
      this.imageInfos.push(imageInfo2);
      this.imageInfos.push(imageInfo3);
      // this.imageInfos.push(imageInfo);
      // this.imageInfos.push(imageInfo);
      this.currentImageInfo = imageInfo;
    }
    this.getPolygonDataAsync().then(()=>{
      imageInfo2.polygonVms = imageInfo.polygonVms;
      imageInfo3.polygonVms = imageInfo.polygonVms;
    });
    // this.imageInfos.push(imageInfo);
  }

  async getPolygonDataAsync(): Promise<void> {
    if (!this.currentImageInfo) {
      return;
    }
    const multiPoints: number[][][] = await this.httpService.getJsonDataAsync();
    // if (!this.imageInfo) {
    //   return;
    // }
    // const imageSize = new Size(this.imageWidth, this.imageHeight);
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
      this.currentImageInfo.polygonVms = polygonVms;
    }

    // this.currentPolygonVms?.forEach((polygon: PolygonViewModel) => {
    //   this.drawPolygon(canvas, polygon.scaledPoints, <Size>this.imageInfo?.scaledSize, polygon.color, 1, this.thickness);
    // });
  }

}

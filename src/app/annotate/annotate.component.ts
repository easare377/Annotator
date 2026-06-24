import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {Point} from "../../models/point";
import {Utils} from "../utils";
import {PolygonViewModel} from "../../models/polygon-view-model";
import {HttpService} from "../../services/http.service";
import {ObjectClassViewModel} from "../../models/object-class-view-model";
import {AppManagerService} from "../../services/app-manager.service";
import {NavigationService} from "../../services/navigation.service";
import { HttpResponse } from "@angular/common/http";
import {ImageInfoResponseBody} from "../../models/image-info-response-body";
import {ImageInfoRequestBody} from "../../models/imageInfo-request-body";
import {Size} from "../../models/size";
import {ActivatedRoute} from "@angular/router";
import {ProjectDataResponseBody} from "../../models/project-data-response-body";
import {ObjectClassResponseBody} from "../../models/object-class-response-body";
import {PolygonInfoResponseBody} from "../../models/polygon-info-response-body";
import {PolygonInfoRequestBody} from "../../models/polygon-info-request-body";
import {UploadState} from "../../models/enum/upload-state";
import {ObjectClassInfosRequestBody} from "../../models/object-class-infos-request-body";
import {ProjectInfoResponseBody} from "../../models/project-info-response-body";
import {ImageUrls} from "../../models/image-urls";
import Stack from "easare-utils-module/dist/collection/stack/stack";
import {AssignClassDialogComponent} from "../dialogs/assign-class-dialog/assign-class-dialog.component";
import {PromptsViewModel} from "../../models/prompts-view-model";
import {MultiPolygonComponent} from "./multi-polygon/multi-polygon.component";
import {PromptTool} from "../../models/enum/prompt-tool";
import { PointType } from '../../models/enum/point-type';
import { Prompts } from '../../models/prompts';

interface ClassificationChange {
  polygonId: string;
  beforeClassId: string | undefined;
  afterClassId: string | undefined;
}

interface ClassificationHistoryAction {
  imageId: string;
  changes: ClassificationChange[];
}

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrl: './annotate.component.css'
})
export class AnnotateComponent implements OnInit {
  protected readonly PromptTool = PromptTool;
  public projectId!: string;
  public imageInfoVms: ImageInfoViewModel[];
  public currentImageInfo: ImageInfoViewModel | undefined;
  public currentObjectClassVm: ObjectClassViewModel | undefined;
  // protected readonly UploadState = UploadState;
  @Input() objectClassVms!: Array<ObjectClassViewModel>;
  // progresses
  public generatingPolygons = false;
  public updatingPolygonClasses = false;
  public panModeEnabled = false;
  public currentPromptTool: PromptTool = PromptTool.NONE;
  public statFaded = false;
  public projectName: string | undefined;
  public projectInfo: ProjectInfoResponseBody | undefined;
  private undoStack = new Stack<ClassificationHistoryAction>();
  private redoStack = new Stack<ClassificationHistoryAction>();
  @ViewChild(MultiPolygonComponent) private multiPolygon: MultiPolygonComponent | undefined;

  constructor(public httpService: HttpService, public navService: NavigationService,
              public appManagerService: AppManagerService, private route: ActivatedRoute) {
    // super(httpService, navService,appManagerService);
    this.imageInfoVms = [];
    this.objectClassVms = new Array<ObjectClassViewModel>();
  }

  initializeData(): void {
    // Init logic anytime the page is routed to.
    this.imageInfoVms = [];
    this.objectClassVms = new Array<ObjectClassViewModel>();
    this.resetClassificationHistory();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const projectId: string | undefined = params['pid'];
      const currentImageId: string | undefined = params['imid'];

      if (!projectId) {
        await this.navService.gotoProjectPageAsync();
        return;
      }

      if (this.projectId !== projectId || this.imageInfoVms.length === 0) {
        this.projectId = projectId;
        this.initializeData();
        await this.getProjectDataAsync(projectId);
      }

      const imageInfo: ImageInfoViewModel | undefined =
        this.imageInfoVms.find(image => image.imageId === currentImageId);
      this.currentImageInfo = imageInfo;

      if (imageInfo && imageInfo.polygonVms === undefined) {
        const polygonsRespBody: PolygonInfoResponseBody[] =
          await this.getImagePolygonsAsync(imageInfo.imageId);
        this.createPolygonVms(polygonsRespBody, imageInfo);
      }
    });
  }

  // Creates the polygon view models
  createPolygonVms(polygonsRespBody: PolygonInfoResponseBody[],
                   imageInfo: ImageInfoViewModel | undefined = this.currentImageInfo): void {
    if (!imageInfo) return;
    const polygonVms: PolygonViewModel[] = [];
    imageInfo.annotatedPolygonVms.splice(0);
    polygonsRespBody.forEach(polygonRspBody => {
      const polygonId: string = polygonRspBody.polygonId;
      const points = polygonRspBody.points;
      const classId: string | undefined = polygonRspBody.classId;
      const polygonVm = new PolygonViewModel(polygonId, points, Utils.generateRandomColor());
      // assign the selected class of the polygon using the class id.
      if (classId){
        polygonVm.objectClassVm = this.objectClassVms.find(x => x.classId === classId);
        // update the annotated classes.
        if (polygonVm.objectClassVm) {
          imageInfo.annotatedPolygonVms.push(polygonVm);
        }
      }
      polygonVms.push(polygonVm)
    });
    imageInfo.polygonVms = polygonVms;
  }

  async generatePolygonsAsync(imageId: string): Promise<void> {
    const imageInfo: ImageInfoViewModel | undefined =
      this.imageInfoVms.find(image => image.imageId === imageId);
    if (!imageInfo) return;
    this.generatingPolygons = true;
    try {
      const promptsVm = imageInfo.promptsVm;
      const positivePoints: Point[] = promptsVm.pointVms
        .filter(pointVm => pointVm.pointType === PointType.POSITIVE)
        .map(pointVm => pointVm.point);
      const negativePoints: Point[] = promptsVm.pointVms
        .filter(pointVm => pointVm.pointType === PointType.NEGATIVE)
        .map(pointVm => pointVm.point);
      const prompts = new Prompts(positivePoints, negativePoints, promptsVm.bbox);
      const resp: HttpResponse<PolygonInfoResponseBody[]> =
        await this.httpService.generateImagePolygonsAsync(new PolygonInfoRequestBody(imageId, prompts));
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          // Display polygons
          this.createPolygonVms(resp.body, imageInfo);
          break;
        default:
          throw new Error();
      }
    } finally {
      this.generatingPolygons = false;
    }
  }

  async getImagePolygonsAsync(imageId: string): Promise<PolygonInfoResponseBody[]> {
    const resp: HttpResponse<PolygonInfoResponseBody[]> =
      await this.httpService.getImagePolygonsAsync(new PolygonInfoRequestBody(imageId));
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
      // console.log(resp);
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          const projectInfoResponseBody: ProjectInfoResponseBody = resp.body.projectInfo
          this.projectInfo = resp.body.projectInfo;
          const objectClassesRespBody: ObjectClassResponseBody[] = resp.body.projectSetup.objectClasses
          const imageInfosRespBody: Array<ImageInfoResponseBody> = resp.body.imageInfos;
          // this.projectName = projectInfoResponseBody.name;
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
    const imageUrls: ImageUrls = projectRespBody.imageUrls;
    const originalFilename: string = projectRespBody.originalFileName
    const imageSize: Size = projectRespBody.imageSize;
    const dateAdded: Date = projectRespBody.dateAdded;
    const dateModified: Date = projectRespBody.dateModified;
    const imageInfoVm =
      new ImageInfoViewModel(imageId, imageUrls, imageSize, originalFilename, dateAdded, dateModified);
    this.imageInfoVms.push(imageInfoVm);
  }

  // async getPolygonDataAsync(dataUrl: string): Promise<PolygonViewModel[]> {
  //   const multiPoints: number[][][] = await this.httpService.getJsonDataAsync(dataUrl);
  //   let polygonVms: PolygonViewModel[] = [];
  //   if (multiPoints) {
  //     multiPoints.forEach((polygonPoints: number[][]) => {
  //       const points: Array<Point> = polygonPoints.map(point => new Point(point[0], point[1]));
  //       const color: string = Utils.generateRandomColor();
  //       const polygonVm = new PolygonViewModel(Utils.generateUUID(), points, color);
  //       // const polygonVm = this.createPolygonVms(canvas, points, <ImageInfo>this.imageInfo, color);
  //       polygonVms.push(polygonVm);
  //     });
  //     polygonVms = Utils.sortPolygonsByArea(polygonVms);
  //     // this.currentImageInfo.polygonVms = polygonVms;
  //   }
  //   return polygonVms;
  // }

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

  getObjectClassAnnotationCount(objectClassVm: ObjectClassViewModel): number {
    if (!this.currentImageInfo?.polygonVms) return 0;
    return this.currentImageInfo.polygonVms.filter(polygonVm =>
      polygonVm.objectClassVm?.classId === objectClassVm.classId
    ).length;
  }

  highlightObjectClassPolygons(objectClassVm: ObjectClassViewModel): void {
    if (!this.currentImageInfo?.polygonVms) return;
    this.currentImageInfo.polygonVms.forEach((polygonVm: PolygonViewModel) => {
      const matchesClass: boolean = polygonVm.objectClassVm?.classId === objectClassVm.classId;
      polygonVm.mouseOver = matchesClass;
      polygonVm.dimmed = !matchesClass;
    });
    this.redrawCurrentPolygons();
  }

  clearObjectClassPolygonHighlight(): void {
    if (!this.currentImageInfo?.polygonVms) return;
    this.currentImageInfo.polygonVms.forEach((polygonVm: PolygonViewModel) => {
      polygonVm.mouseOver = false;
      polygonVm.dimmed = false;
    });
    this.redrawCurrentPolygons();
  }

  get canUndoClassification(): boolean {
    return this.undoStack.size > 0;
  }

  get canRedoClassification(): boolean {
    return this.redoStack.size > 0;
  }

  handlePolygonClicked(polygonVm: PolygonViewModel, assignDialog: AssignClassDialogComponent): void {
    if (this.currentObjectClassVm) {
      this.assignPolygonClass(polygonVm, this.currentObjectClassVm);
      return;
    }
    assignDialog.polygonVm = polygonVm;
    assignDialog.showDialog();
  }

  assignClassFromDialog(polygonVm: PolygonViewModel | undefined, objectClassVm: ObjectClassViewModel | undefined): void {
    if (!polygonVm) return;
    this.assignPolygonClass(polygonVm, objectClassVm);
  }

  updateStatFade(event: PointerEvent, statElement: HTMLElement): void {
    const rect: DOMRect = statElement.getBoundingClientRect();
    this.statFaded = event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
  }

  get hasPrompts(): boolean {
    return this.currentPromptsVm?.hasPrompts ?? false;
  }

  togglePromptTool(promptTool: PromptTool): void {
    this.currentPromptTool = this.currentPromptTool === promptTool ? PromptTool.NONE : promptTool;
    if (this.currentPromptTool !== PromptTool.NONE) {
      this.panModeEnabled = false;
    }
  }

  togglePanMode(): void {
    this.panModeEnabled = !this.panModeEnabled;
    if (this.panModeEnabled) {
      this.currentPromptTool = PromptTool.NONE;
    }
  }

  undoPrompt(): void {
    this.currentPromptsVm?.undo();
    this.multiPolygon?.redrawPrompts();
  }

  clearPrompts(): void {
    this.currentPromptsVm?.clear();
    this.multiPolygon?.redrawPrompts();
  }

  assignPolygonClass(polygonVm: PolygonViewModel, objectClassVm: ObjectClassViewModel | undefined): void {
    if (!this.currentImageInfo) return;
    const action: ClassificationHistoryAction = {
      imageId: this.currentImageInfo.imageId,
      changes: [{
        polygonId: polygonVm.id,
        beforeClassId: polygonVm.objectClassVm?.classId,
        afterClassId: objectClassVm?.classId
      }]
    };
    this.applyNewClassificationAction(action);
  }

  undoClassification(): void {
    const action: ClassificationHistoryAction | undefined = this.popHistoryAction(this.undoStack);
    if (!action) return;
    this.applyClassificationAction(action, 'before');
    this.redoStack.push(action);
  }

  redoClassification(): void {
    const action: ClassificationHistoryAction | undefined = this.popHistoryAction(this.redoStack);
    if (!action) return;
    this.applyClassificationAction(action, 'after');
    this.undoStack.push(action);
  }

  handleObjectClassAssigned(polygonVm: PolygonViewModel): void {
    if (!this.currentImageInfo) return;
    const annotatedPolygonVms = this.currentImageInfo.annotatedPolygonVms;
    const annotatedIndex: number = annotatedPolygonVms.indexOf(polygonVm);
    if (polygonVm.objectClassVm && annotatedIndex === -1) {
      annotatedPolygonVms.push(polygonVm);
      return;
    }
    if (!polygonVm.objectClassVm && annotatedIndex !== -1) {
      annotatedPolygonVms.splice(annotatedIndex, 1);
    }
  }

  clearPolygonAnnotation(polygonVm: PolygonViewModel): void {
    if (!this.currentImageInfo || !polygonVm.objectClassVm) return;
    this.applyNewClassificationAction({
      imageId: this.currentImageInfo.imageId,
      changes: [{
        polygonId: polygonVm.id,
        beforeClassId: polygonVm.objectClassVm.classId,
        afterClassId: undefined
      }]
    });
  }

  clearAllImageAnnotations(): void {
    if (!this.currentImageInfo?.polygonVms) return;
    const changes: ClassificationChange[] = this.currentImageInfo.polygonVms
      .filter((polygonVm: PolygonViewModel) => !!polygonVm.objectClassVm)
      .map((polygonVm: PolygonViewModel) => ({
        polygonId: polygonVm.id,
        beforeClassId: polygonVm.objectClassVm?.classId,
        afterClassId: undefined
      }));
    this.applyNewClassificationAction({
      imageId: this.currentImageInfo.imageId,
      changes
    });
  }

  private applyNewClassificationAction(action: ClassificationHistoryAction): void {
    const actionableChanges: ClassificationChange[] = action.changes.filter((change: ClassificationChange) =>
      change.beforeClassId !== change.afterClassId
    );
    if (!actionableChanges.length) return;
    const normalizedAction: ClassificationHistoryAction = {
      imageId: action.imageId,
      changes: actionableChanges
    };
    this.applyClassificationAction(normalizedAction, 'after');
    this.undoStack.push(normalizedAction);
    this.redoStack = new Stack<ClassificationHistoryAction>();
  }

  private applyClassificationAction(action: ClassificationHistoryAction, target: 'before' | 'after'): void {
    const imageInfo: ImageInfoViewModel | undefined = this.imageInfoVms.find((image: ImageInfoViewModel) =>
      image.imageId === action.imageId
    );
    if (!imageInfo?.polygonVms) return;
    action.changes.forEach((change: ClassificationChange) => {
      const polygonVm: PolygonViewModel | undefined = imageInfo.polygonVms?.find((polygon: PolygonViewModel) =>
        polygon.id === change.polygonId
      );
      if (!polygonVm) return;
      const classId: string | undefined = target === 'before' ? change.beforeClassId : change.afterClassId;
      polygonVm.mouseOver = false;
      polygonVm.dimmed = false;
      polygonVm.objectClassVm = this.getObjectClassById(classId);
    });
    this.rebuildAnnotatedPolygons(imageInfo);
    if (imageInfo === this.currentImageInfo) {
      this.redrawCurrentPolygons();
    }
  }

  private rebuildAnnotatedPolygons(imageInfo: ImageInfoViewModel): void {
    imageInfo.annotatedPolygonVms.splice(0);
    imageInfo.polygonVms?.forEach((polygonVm: PolygonViewModel) => {
      if (polygonVm.objectClassVm) {
        imageInfo.annotatedPolygonVms.push(polygonVm);
      }
    });
  }

  private getObjectClassById(classId: string | undefined): ObjectClassViewModel | undefined {
    if (!classId) return undefined;
    return this.objectClassVms.find((objectClassVm: ObjectClassViewModel) => objectClassVm.classId === classId);
  }

  private get currentPromptsVm(): PromptsViewModel | undefined {
    return this.currentImageInfo?.promptsVm;
  }

  private popHistoryAction(stack: Stack<ClassificationHistoryAction>): ClassificationHistoryAction | undefined {
    if (stack.size === 0) return undefined;
    return stack.pop().value;
  }

  private resetClassificationHistory(): void {
    this.undoStack = new Stack<ClassificationHistoryAction>();
    this.redoStack = new Stack<ClassificationHistoryAction>();
  }

  private redrawCurrentPolygons(): void {
    const polygonVms: PolygonViewModel[] | undefined = this.currentImageInfo?.polygonVms;
    if (!polygonVms?.length) return;
    const redrawPolygonVm: PolygonViewModel | undefined = polygonVms.find(polygonVm => polygonVm.onMouseOver);
    if (redrawPolygonVm?.onMouseOver) {
      redrawPolygonVm.onMouseOver();
      return;
    }
    polygonVms.forEach((polygonVm: PolygonViewModel) => polygonVm.drawPolygon());
  }

  async saveObjectClassesAsync(): Promise<void> {
    this.updatingPolygonClasses = true;
    const objectClassInfos = new ObjectClassInfosRequestBody();
    //Add all annotated polygons.
    if (this.currentImageInfo && this.currentImageInfo.polygonVms) {
      this.currentImageInfo.polygonVms.forEach((polygonVm: PolygonViewModel) => {
        if (polygonVm.objectClassVm) {
          objectClassInfos.addObjectClassInfo(polygonVm.id, polygonVm.objectClassVm.classId);
        }
      });
    }
    //Create a web request to send the annotated polygons.
    try {
      const resp: HttpResponse<string> =
        await this.httpService.savePolygonObjectClassesAsync(objectClassInfos);
      switch (resp.status) {
        case 200:
          if (resp.body !== 'done') {
            throw new Error();
          }
          break;
        default:
          throw new Error();
      }
    } catch (e) {
      console.log(e);
    }
    this.updatingPolygonClasses  = false;
  }

}

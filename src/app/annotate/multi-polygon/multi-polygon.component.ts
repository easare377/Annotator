import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {PolygonViewModel} from "../../../models/polygon-view-model";
import {Size} from "../../../models/size";
import {Point} from "../../../models/point";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";
import {PolygonCanvasRendererService} from "../../../services/polygon-canvas-renderer.service";
import {PointType} from "../../../models/enum/point-type";
import {PointViewModel} from "../../../models/point-view-model";
import {BBox} from "../../../models/bbox";
import {PromptsViewModel} from "../../../models/prompts-view-model";
import {ImageCacheService} from "../../../services/image-cache.service";
import {PromptTool} from "../../../models/enum/prompt-tool";
import {AnnotationDisplayMode} from "../../../models/enum/annotation-display-mode";

/**
 * Component to display and interact with multiple polygons overlaid on an image.
 */
@Component({
  selector: 'app-multi-polygon',
  templateUrl: './multi-polygon.component.html',
  styleUrl: './multi-polygon.component.css'
})
export class MultiPolygonComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  private image: HTMLImageElement | undefined; // Image element
  private currentPolygonVms: PolygonViewModel[] = []; // Array to hold current polygon view models
  private imagePosition: Point = new Point(0, 0);
  private panStartClientPosition: Point = new Point(0, 0);
  private panStartImagePosition: Point = new Point(0, 0);
  private hasPanned: boolean = false;
  private hasRenderedImage: boolean = false;
  private resizeObserver: ResizeObserver | undefined;
  private renderAnimationFrame: number | undefined;
  private activePointerId: number | undefined;
  private activePointerStartedWithPan: boolean = false;
  private activePointerPromptTool: PromptTool = PromptTool.NONE;
  private imageLoadRequestId: number = 0;
  private draftBboxStart: Point | undefined;
  private draftBbox: BBox | undefined;
  isPanning: boolean = false;
  isImageLoading: boolean = false;
  imageLoadFailed: boolean = false;

  @ViewChild('parent') parent!: ElementRef<HTMLDivElement>; // Reference to the canvas container
  @ViewChild('imgCanvas') imgCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the image canvas
  @ViewChild('polygonCanvas') polygonCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the polygon canvas
  @ViewChild('promptCanvas') promptCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the prompt canvas

  /**
   * Thickness of the polygon borders in pixels.
   */
  @Input() thickness: number = 1;

  /**
   * Information about the image and the polygons to be displayed.
   */
  @Input() imageInfo!: ImageInfoViewModel;

  // /**
  //  * Determines how much the image should be zoomed.
  //  */
  // @Input() zoomLevel: number = 100; // Initial zoom level

  /**
   * Factor by which the image and polygons should be zoomed in/out.
   */
  @Input() zoomFactor: number = 1;

  /**
   * Determines whether pointer drag should pan the image.
   */
  @Input() panEnabled: boolean = false;

  /**
   * Current prompt drawing tool selected by the parent toolbar.
   */
  @Input() promptTool: PromptTool = PromptTool.NONE;

  /** Visual representation of existing annotations. */
  @Input() annotationDisplayMode: AnnotationDisplayMode = AnnotationDisplayMode.POLYGONS;

  /**
   * Event emitted when a polygon is clicked.
   */
  @Output() polygonClicked = new EventEmitter<PolygonViewModel>();

  /**
   * Event emitted when a class is assigned to a polygon.
   */
  @Output() objectClassAssigned = new EventEmitter<PolygonViewModel>();

  /**
   * Initializes a new instance of the MultiPolygonComponent class.
   */
  constructor(private renderer: PolygonCanvasRendererService, private imageCache: ImageCacheService) {
  }

  ngOnInit(): void {
    this.onDocumentLoaded();
  }

  ngAfterViewInit(): void {
    this.observeCanvasSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageInfo']) {
      const previousValue = changes['imageInfo'].previousValue as ImageInfoViewModel | undefined;
      const currentValue = changes['imageInfo'].currentValue as ImageInfoViewModel;
      if (previousValue) {
        previousValue.onPolygonsChanged = undefined;
      }
      this.imagePosition = currentValue.viewportPosition ?? new Point(0, 0);
      this.hasRenderedImage = false;
      currentValue.onPolygonsChanged = ()=>{
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;
        this.queueRender(currentValue.zoomLevel, currentValue.viewportPosition);
      }
      if (this.imgCanvas){
        this.onDocumentLoaded();
      }
    }
    if (changes['annotationDisplayMode'] && this.image && this.hasRenderedImage) {
      this.queueRender(this.imageInfo.zoomLevel, this.imagePosition);
    }
  }

  ngOnDestroy(): void {
    this.imageLoadRequestId++;
    if (this.renderAnimationFrame !== undefined) {
      cancelAnimationFrame(this.renderAnimationFrame);
    }
    this.resizeObserver?.disconnect();
    if (this.imageInfo) {
      this.imageInfo.onPolygonsChanged = undefined;
    }
  }

  /**
   * Handles the mouse wheel event to zoom in/out the image and polygons.
   * @param event The wheel event.
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault(); // Prevent the window from scrolling
    if (this.isImageLoading || this.imageLoadFailed) return;
    const zoomAnchor: Point | undefined = this.renderer.computeCanvasMousePosition(this.polygonCanvas.nativeElement, event);
    if (event.deltaY < 0) {
      this.zoomIn(zoomAnchor);
    } else {
      this.zoomOut(zoomAnchor);
    }
  }

  /**
   * Loads the image and sets up the polygons on the canvas.
   */
  onDocumentLoaded(): void {
    this.loadImage();
  }

  private loadImage(forceReload: boolean = false): void {
    const imageInfo: ImageInfoViewModel | undefined = this.imageInfo;
    if (!imageInfo) return;
    const imageUrl: string = imageInfo.imageUrls.jpg;
    const requestId: number = ++this.imageLoadRequestId;
    this.isImageLoading = true;
    this.imageLoadFailed = false;
    this.image = undefined;
    this.imagePosition = imageInfo.viewportPosition ?? new Point(0, 0);

    if (forceReload) {
      this.imageCache.invalidate(imageUrl);
    }

    this.imageCache.load(imageUrl).then((image: HTMLImageElement) => {
      if (requestId !== this.imageLoadRequestId || this.imageInfo !== imageInfo) return;
      this.image = image;
      this.isImageLoading = false;
      this.imageLoadFailed = false;
      this.isPanning = false;
      this.hasRenderedImage = false;
      this.queueRender(imageInfo.zoomLevel, imageInfo.viewportPosition);
    }).catch(() => {
      if (requestId !== this.imageLoadRequestId || this.imageInfo !== imageInfo) return;
      this.image = undefined;
      this.isImageLoading = false;
      this.imageLoadFailed = true;
      this.isPanning = false;
      this.hasRenderedImage = false;
    });
  }

  retryImageLoad(): void {
    this.loadImage(true);
  }

  private observeCanvasSize(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.image) return;
      this.queueRender(this.imageInfo.zoomLevel, this.imagePosition);
    });
    this.resizeObserver.observe(this.parent.nativeElement);
  }

  private queueRender(zoomPer: number, imagePosition?: Point): void {
    if (this.renderAnimationFrame !== undefined) {
      cancelAnimationFrame(this.renderAnimationFrame);
    }
    this.renderAnimationFrame = requestAnimationFrame(() => {
      this.renderAnimationFrame = undefined;
      this.renderImageAndPolygons(zoomPer, imagePosition);
    });
  }

  private syncCanvasSize(): boolean {
    if (!this.parent || !this.imgCanvas || !this.polygonCanvas || !this.promptCanvas) return false;
    return this.renderer.syncCanvasSize(this.parent.nativeElement, [
      this.imgCanvas.nativeElement,
      this.polygonCanvas.nativeElement,
      this.promptCanvas.nativeElement
    ]);
  }

  /**
   * Sets up the polygon view model with event handlers for clicks and mouse overs.
   * @param polygonVm The polygon view model.
   * @param canvas The canvas element.
   * @param imageInfo The image information.
   * @returns The updated polygon view model.
   */
  setupPolygonVms(polygonVm: PolygonViewModel, canvas: HTMLCanvasElement, imageInfo: ImageInfoViewModel): PolygonViewModel {
    polygonVm.onClick = () => {
      this.polygonClicked.emit(polygonVm); // Emit the polygonClicked event when the polygon is clicked
    };
    // Update the polygons when object class is set.
    polygonVm.onClassSet = () => {
      this.redrawCurrentPolygons(canvas);
      this.objectClassAssigned.emit(polygonVm);
    };
    // Update the polygons if mouse over.
    polygonVm.onMouseOver = () => {
      this.redrawCurrentPolygons(canvas);
    };

    polygonVm.onDrawPolygon = () => {
      this.redrawCurrentPolygons(canvas);
    };
    return polygonVm;
  }

  private redrawCurrentPolygons(canvas: HTMLCanvasElement): void {
    this.renderer.renderPolygons(
      canvas,
      this.currentPolygonVms,
      this.imageInfo.scaledSize,
      this.thickness,
      this.annotationDisplayMode
    );
  }

  redrawPrompts(): void {
    if (!this.promptCanvas) return;
    this.renderer.renderPrompts(
      this.promptCanvas.nativeElement,
      this.currentPromptsVm,
      this.imagePosition,
      this.imageInfo.scaledSize,
      this.draftBbox
    );
  }

  /**
   * Zooms in the image and polygons by the specified zoom factor.
   */
  zoomIn(anchorCanvasPosition?: Point): void {
    this.zoom(this.imageInfo.zoomLevel + this.zoomFactor, anchorCanvasPosition); // Apply the new zoom level
  }

  /**
   * Zooms out the image and polygons by the specified zoom factor.
   */
  zoomOut(anchorCanvasPosition?: Point): void {
    this.zoom(this.imageInfo.zoomLevel - this.zoomFactor, anchorCanvasPosition); // Apply the new zoom level
  }

  /**
   * Applies the specified zoom percentage to the image and polygons.
   * @param zoomPer The zoom percentage.
   */
  zoom(zoomPer: number, anchorCanvasPosition?: Point): void {
    if (!this.image) return;
    const clampedZoom: number = this.renderer.clamp(zoomPer, 100, 1000);
    const imagePosition: Point | undefined = this.renderer.computeAnchoredImagePosition(
      this.image,
      this.polygonCanvas.nativeElement,
      this.imagePosition,
      this.imageInfo.scaledSize,
      clampedZoom,
      this.hasRenderedImage,
      anchorCanvasPosition
    );
    this.imageInfo.zoomLevel = clampedZoom;
    this.renderImageAndPolygons(clampedZoom, imagePosition);
  }

  private renderImageAndPolygons(zoomPer: number, imagePosition?: Point): void {
    if (!this.image) return;
    if (!this.image.complete || this.image.naturalWidth === 0 || this.image.naturalHeight === 0) return;
    if (!this.syncCanvasSize()) return;
    const imgParams: { imagePosition: Point, imageSize: Size } = this.renderer.computeZoomParameters(this.image, zoomPer);
    const imgPos: Point = this.renderer.clampImagePosition(this.image, imagePosition ?? imgParams.imagePosition, imgParams.imageSize);
    const imgSize: Size = imgParams.imageSize;
    this.imagePosition = imgPos;
    this.imageInfo.viewportPosition = imgPos;
    this.imageInfo.scaledSize = imgSize;
    this.renderer.displayImage(this.image, this.imgCanvas.nativeElement, zoomPer, imgPos); // Display the zoomed image
    this.hasRenderedImage = true;
    this.currentPolygonVms = [];

    if (!this.imageInfo.polygonVms) {
      this.renderer.clearCanvas(this.polygonCanvas.nativeElement);
      this.redrawPrompts();
      return;
    }

    const croppedPolygons: PolygonViewModel[] = this.renderer.getVisiblePolygons(this.imageInfo.polygonVms, imgPos, imgSize);
    this.currentPolygonVms = croppedPolygons;

    croppedPolygons.forEach((p: PolygonViewModel) => {
      p.setScaledGeometry(
        this.renderer.computeDisplayPoints(p.truePoints, imgPos, imgSize),
        p.trueInnerPolygons.map((innerPolygon: Point[]) =>
          this.renderer.computeDisplayPoints(innerPolygon, imgPos, imgSize)
        )
      );
      this.setupPolygonVms(p, this.polygonCanvas.nativeElement, this.imageInfo);
    });
    this.renderer.renderPolygons(
      this.polygonCanvas.nativeElement,
      croppedPolygons,
      this.imageInfo.scaledSize,
      this.thickness,
      this.annotationDisplayMode
    );
    this.redrawPrompts();
  }

  onPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0 || !this.image) return;
    if (!this.isPointerInsideImage(event)) return;
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement;
    canvas.setPointerCapture(event.pointerId);
    this.activePointerId = event.pointerId;
    this.activePointerStartedWithPan = this.panEnabled;
    this.activePointerPromptTool = this.panEnabled ? PromptTool.NONE : this.promptTool;
    this.isPanning = this.activePointerStartedWithPan;
    this.hasPanned = false;
    this.panStartClientPosition = new Point(event.clientX, event.clientY);
    this.panStartImagePosition = new Point(this.imagePosition.x, this.imagePosition.y);
    if (this.activePointerPromptTool === PromptTool.BBOX) {
      this.draftBboxStart = this.computePointerSourcePosition(event);
      this.draftBbox = this.draftBboxStart
        ? BBox.fromBbox(this.draftBboxStart.x, this.draftBboxStart.y, this.draftBboxStart.x, this.draftBboxStart.y)
        : undefined;
      this.redrawPrompts();
    }
  }

  onPointerMove(event: PointerEvent): void {
    if (this.isActivePointer(event)) {
      this.updatePointerMovement(event);
    }
    if (this.isActivePointer(event) && this.activePointerStartedWithPan && this.isPanning) {
      this.panImage(event);
      return;
    }
    if (this.isActivePointer(event) && this.activePointerPromptTool === PromptTool.BBOX) {
      this.updateDraftBbox(event);
      return;
    }
    if (this.promptTool !== PromptTool.NONE) return;
    this.onCanvasHover(event);
  }

  onPointerLeave(event: PointerEvent): void {
    if (this.isActivePointer(event)) return;
    this.clearHoveredPolygons();
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isActivePointer(event)) return;
    const promptTool: PromptTool = this.activePointerPromptTool;
    const pointerInsideImage: boolean = this.isPointerInsideImage(event);
    if (promptTool !== PromptTool.NONE) {
      this.completePrompt(event, promptTool);
      this.finishPointerInteraction(event);
      this.redrawPrompts();
      if (!pointerInsideImage) {
        this.clearHoveredPolygons();
      }
      return;
    }
    const shouldSelectPolygon: boolean = !this.activePointerStartedWithPan && !this.hasPanned;
    this.finishPointerInteraction(event);
    if (shouldSelectPolygon && pointerInsideImage) {
      this.selectPolygonAtPointer(event);
    }
    if (!pointerInsideImage) {
      this.clearHoveredPolygons();
    }
  }

  onPointerCancel(event: PointerEvent): void {
    if (!this.isActivePointer(event)) return;
    this.finishPointerInteraction(event);
    this.clearHoveredPolygons();
    this.redrawPrompts();
  }

  private isActivePointer(event: PointerEvent): boolean {
    return this.activePointerId === event.pointerId;
  }

  private panImage(event: PointerEvent): void {
    if (!this.image) return;
    if (event.buttons === 0) {
      this.finishPointerInteraction(event);
      return;
    }
    event.preventDefault();
    const rect: DOMRect = this.polygonCanvas.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nextImagePosition: Point | undefined = this.renderer.computePannedImagePosition(
      this.panStartImagePosition,
      this.panStartClientPosition,
      event,
      this.imageInfo.scaledSize,
      rect
    );
    if (!nextImagePosition) return;
    this.queueRender(this.imageInfo.zoomLevel, nextImagePosition);
  }

  private finishPointerInteraction(event: PointerEvent): void {
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement | null;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    this.isPanning = false;
    this.activePointerId = undefined;
    this.activePointerStartedWithPan = false;
    this.activePointerPromptTool = PromptTool.NONE;
    this.draftBboxStart = undefined;
    this.draftBbox = undefined;
  }

  private updatePointerMovement(event: PointerEvent): void {
    const dx: number = event.clientX - this.panStartClientPosition.x;
    const dy: number = event.clientY - this.panStartClientPosition.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      this.hasPanned = true;
    }
  }

  /**
   * Handles pointer selection inside polygons.
   * @param event The mouse event.
   */
  selectPolygonAtPointer(event: PointerEvent): void {
    const canvas = this.polygonCanvas.nativeElement;
    const rect: DOMRect = canvas.getBoundingClientRect();
    const hPosition: Point | undefined =
      this.renderer.computePointerImagePosition(event, this.imageInfo.scaledSize, rect);
    if (!hPosition) return;
    const polygon: PolygonViewModel | undefined = this.renderer.findPolygonAtPoint(
      canvas,
      this.currentPolygonVms,
      hPosition,
      this.annotationDisplayMode
    );
    if (polygon && polygon.onClick) {
      polygon.onClick(); // Call the polygon's onClick function if the click is inside it
    }
  }

  /**
   * Handles the canvas hover event to detect mouse over polygons.
   * @param event The mouse event.
   */
  onCanvasHover(event: MouseEvent): void {
    if (!this.imageInfo) return;
    const canvas = event.target as HTMLCanvasElement;
    if (!this.isPointerInsideCanvas(event, canvas)) {
      this.clearHoveredPolygons();
      return;
    }
    const rect: DOMRect = canvas.getBoundingClientRect();
    const hPosition: Point | undefined =
      this.renderer.computePointerImagePosition(event, this.imageInfo.scaledSize, rect);
    if (!hPosition) {
      this.clearHoveredPolygons();
      return;
    }

    // Check each polygon to see if the mouse is over it
    const polygon: PolygonViewModel | undefined = this.renderer.findPolygonAtPoint(
      canvas,
      this.currentPolygonVms,
      hPosition,
      this.annotationDisplayMode
    );
    let hoverChanged: boolean = false;
    this.currentPolygonVms.forEach((p: PolygonViewModel) => {
      const shouldHover: boolean = p === polygon;
      if (p.mouseOver !== shouldHover) {
        p.mouseOver = shouldHover;
        hoverChanged = true;
      }
    });
    if (hoverChanged) {
      this.redrawCurrentPolygons(canvas);
    }
  }

  private clearHoveredPolygons(): void {
    let hoverChanged: boolean = false;
    this.currentPolygonVms.forEach((polygon: PolygonViewModel) => {
      if (polygon.mouseOver) {
        polygon.mouseOver = false;
        hoverChanged = true;
      }
    });
    if (hoverChanged && this.polygonCanvas) {
      this.redrawCurrentPolygons(this.polygonCanvas.nativeElement);
    }
  }

  private isPointerInsideCanvas(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    const rect: DOMRect = canvas.getBoundingClientRect();
    return event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
  }

  private isPointerInsideImage(event: MouseEvent): boolean {
    if (!this.polygonCanvas || !this.imageInfo?.scaledSize) return false;
    const canvas: HTMLCanvasElement = this.polygonCanvas.nativeElement;
    return this.renderer.computePointerImagePosition(
      event,
      this.imageInfo.scaledSize,
      canvas.getBoundingClientRect()
    ) !== undefined;
  }

  get isPromptModeActive(): boolean {
    return !this.panEnabled && this.promptTool !== PromptTool.NONE;
  }

  private get currentPromptsVm(): PromptsViewModel | undefined {
    return this.imageInfo?.promptsVm;
  }

  private computePointerSourcePosition(event: MouseEvent, clampToImage: boolean = false): Point | undefined {
    if (!this.image) return undefined;
    const rect: DOMRect = this.polygonCanvas.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;
    const visiblePoint: Point | undefined =
      this.renderer.computePointerImagePosition(event, this.imageInfo.scaledSize, rect, clampToImage);
    if (!visiblePoint) return undefined;
    return new Point(
      this.renderer.clamp(visiblePoint.x + this.imagePosition.x, 0, this.image.naturalWidth),
      this.renderer.clamp(visiblePoint.y + this.imagePosition.y, 0, this.image.naturalHeight)
    );
  }

  private updateDraftBbox(event: PointerEvent): void {
    if (!this.draftBboxStart) return;
    const current: Point | undefined = this.computePointerSourcePosition(event, true);
    if (!current) return;
    this.draftBbox = BBox.fromBbox(
      Math.min(this.draftBboxStart.x, current.x),
      Math.min(this.draftBboxStart.y, current.y),
      Math.max(this.draftBboxStart.x, current.x),
      Math.max(this.draftBboxStart.y, current.y)
    );
    this.redrawPrompts();
  }

  private completePrompt(event: PointerEvent, promptTool: PromptTool): void {
    const promptsVm: PromptsViewModel | undefined = this.currentPromptsVm;
    if (!promptsVm) return;
    if (promptTool === PromptTool.BBOX) {
      this.updateDraftBbox(event);
      if (this.draftBbox && this.isUsableBbox(this.draftBbox)) {
        promptsVm.addBbox(this.draftBbox);
      }
      return;
    }
    if (this.hasPanned) return;
    const pointType: PointType | undefined = this.getPointType(promptTool);
    if (pointType === undefined) return;
    const point: Point | undefined = this.computePointerSourcePosition(event);
    if (point) {
      promptsVm.addPoint(new PointViewModel(pointType, point));
    }
  }

  private getPointType(promptTool: PromptTool): PointType | undefined {
    switch (promptTool) {
      case PromptTool.POSITIVE_POINT:
        return PointType.POSITIVE;
      case PromptTool.NEGATIVE_POINT:
        return PointType.NEGATIVE;
      default:
        return undefined;
    }
  }

  private isUsableBbox(bbox: BBox): boolean {
    const rect: DOMRect = this.polygonCanvas.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const viewport = this.renderer.computeImageViewport(
      new Size(rect.width, rect.height),
      this.imageInfo.scaledSize
    );
    if (viewport.scale === 0) return false;
    const minWidth: number = 3 / viewport.scale;
    const minHeight: number = 3 / viewport.scale;
    return bbox.xMax - bbox.xMin >= minWidth && bbox.yMax - bbox.yMin >= minHeight;
  }

}

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {PolygonViewModel} from "../../../models/polygon-view-model";
import {Size} from "../../../models/size";
import {Point} from "../../../models/point";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";
import {PolygonCanvasRendererService} from "../../../services/polygon-canvas-renderer.service";

/**
 * Component to display and interact with multiple polygons overlaid on an image.
 */
@Component({
  selector: 'app-multi-polygon',
  templateUrl: './multi-polygon.component.html',
  styleUrl: './multi-polygon.component.css'
})
export class MultiPolygonComponent implements AfterViewInit, OnChanges, OnDestroy {
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
  isPanning: boolean = false;

  @ViewChild('parent') parent!: ElementRef<HTMLDivElement>; // Reference to the canvas container
  @ViewChild('imgCanvas') imgCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the image canvas
  @ViewChild('polygonCanvas') polygonCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the polygon canvas

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
  constructor(private renderer: PolygonCanvasRendererService) {
  }

  /**
   * Lifecycle hook that is called after a component's view has been fully initialized.
   * Calls onDocumentLoaded to set up the image and polygons.
   */
  ngAfterViewInit(): void {
    this.observeCanvasSize();
    this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageInfo']) {
      const previousValue = changes['imageInfo'].previousValue as ImageInfoViewModel | undefined;
      const currentValue = changes['imageInfo'].currentValue as ImageInfoViewModel;
      if (previousValue) {
        previousValue.onPolygonsChanged = undefined;
      }
      currentValue.onPolygonsChanged = ()=>{
        if (this.imgCanvas && this.polygonCanvas) {
          this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
        }
      }
      if (this.imgCanvas){
        this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
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
    const zoomAnchor: Point | undefined = this.renderer.computeCanvasMousePosition(this.polygonCanvas.nativeElement, event);
    if (event.deltaY < 0) {
      this.zoomIn(zoomAnchor);
    } else {
      this.zoomOut(zoomAnchor);
    }
  }

  /**
   * Loads the image and sets up the polygons on the canvas.
   * @param imgCanvas The image canvas element.
   * @param polygonCanvas The polygon canvas element.
   */
  onDocumentLoaded(imgCanvas: HTMLCanvasElement, polygonCanvas: HTMLCanvasElement): void {
    const img: HTMLImageElement = new Image();
    this.image = img;
    if (this.imageInfo){
      img.onload = () => {
        this.isPanning = false;
        this.hasRenderedImage = false;
        this.queueRender(this.imageInfo.zoomLevel);
      };
      img.src = this.imageInfo.imageUrls.jpg; // Set the image source URL
    }
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
    if (!this.parent || !this.imgCanvas || !this.polygonCanvas) return false;
    return this.renderer.syncCanvasSize(this.parent.nativeElement, [
      this.imgCanvas.nativeElement,
      this.polygonCanvas.nativeElement
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
        polygonVm.drawPolygon();
        this.objectClassAssigned.emit(polygonVm);
    };
    // Update the polygons if mouse over.
    polygonVm.onMouseOver = () => {
      this.renderer.renderPolygons(canvas, this.currentPolygonVms, this.imageInfo.scaledSize, this.thickness);
    };

    polygonVm.onDrawPolygon = () => {
      this.renderer.renderPolygon(canvas, polygonVm, imageInfo.scaledSize, this.thickness);
    };
    return polygonVm;
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
    this.imageInfo.scaledSize = imgSize;
    this.renderer.displayImage(this.image, this.imgCanvas.nativeElement, zoomPer, imgPos); // Display the zoomed image
    this.hasRenderedImage = true;
    this.currentPolygonVms = [];

    if (!this.imageInfo.polygonVms) {
      this.renderer.clearCanvas(this.polygonCanvas.nativeElement);
      return;
    }

    const croppedPolygons: PolygonViewModel[] = this.renderer.getVisiblePolygons(this.imageInfo.polygonVms, imgPos, imgSize);
    this.currentPolygonVms = croppedPolygons;

    croppedPolygons.forEach((p: PolygonViewModel) => {
      p.scaledPoints = this.renderer.computeDisplayPoints(p.truePoints, imgPos, imgSize); // Compute new display points based on zoom/pan
      this.setupPolygonVms(p, this.polygonCanvas.nativeElement, this.imageInfo);
    });
    this.renderer.renderPolygons(this.polygonCanvas.nativeElement, croppedPolygons, this.imageInfo.scaledSize, this.thickness);
  }

  onPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0 || !this.image) return;
    event.preventDefault();
    const canvas = event.currentTarget as HTMLCanvasElement;
    canvas.setPointerCapture(event.pointerId);
    this.activePointerId = event.pointerId;
    this.isPanning = true;
    this.hasPanned = false;
    this.panStartClientPosition = new Point(event.clientX, event.clientY);
    this.panStartImagePosition = new Point(this.imagePosition.x, this.imagePosition.y);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.isActivePointer(event) && this.isPanning) {
      this.panImage(event);
      return;
    }
    this.onCanvasHover(event);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isActivePointer(event)) return;
    const shouldSelectPolygon: boolean = !this.hasPanned;
    this.finishPointerInteraction(event);
    if (shouldSelectPolygon) {
      this.selectPolygonAtPointer(event);
    }
  }

  onPointerCancel(event: PointerEvent): void {
    if (!this.isActivePointer(event)) return;
    this.finishPointerInteraction(event);
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
    const dx: number = event.clientX - this.panStartClientPosition.x;
    const dy: number = event.clientY - this.panStartClientPosition.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      this.hasPanned = true;
    }
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
  }

  /**
   * Handles pointer selection inside polygons.
   * @param event The mouse event.
   */
  selectPolygonAtPointer(event: PointerEvent): void {
    const canvas = this.polygonCanvas.nativeElement;
    const rect: DOMRect = canvas.getBoundingClientRect();
    const hPosition: Point = this.renderer.computePointerImagePosition(event, this.imageInfo.scaledSize, rect);
    const polygon: PolygonViewModel | undefined = this.renderer.findPolygonAtPoint(canvas, this.currentPolygonVms, hPosition);
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
    const rect: DOMRect = canvas.getBoundingClientRect();
    const hPosition: Point = this.renderer.computePointerImagePosition(event, this.imageInfo.scaledSize, rect);

    // Check each polygon to see if the mouse is over it
    const polygon: PolygonViewModel | undefined = this.renderer.findPolygonAtPoint(canvas, this.currentPolygonVms, hPosition);
    this.currentPolygonVms.forEach((p: PolygonViewModel) => {
      if (p !== polygon){
        p.mouseOver = false;
      }
    });
    if (polygon && !polygon.mouseOver && polygon.onMouseOver) {
      polygon.mouseOver = true;
      polygon.onMouseOver();// Call the polygon's onMouseOver function if the mouse is over it
    }
  }

}

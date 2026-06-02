import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Output,
  OnInit,
  ViewChild,
  EventEmitter, OnChanges, SimpleChanges, AfterViewChecked
} from '@angular/core';
import {PolygonViewModel} from "../../../models/polygon-view-model";
import {Utils} from "../../utils";
import {Size} from "../../../models/size";
import {Point} from "../../../models/point";
import {ImageInfoViewModel} from "../../../models/image-info-view-model";

/**
 * Component to display and interact with multiple polygons overlaid on an image.
 */
@Component({
  selector: 'app-multi-polygon',
  templateUrl: './multi-polygon.component.html',
  styleUrl: './multi-polygon.component.css'
})
export class MultiPolygonComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {
  private image: HTMLImageElement | undefined; // Image element
  private currentPolygonVms: PolygonViewModel[] = []; // Array to hold current polygon view models
  private imagePosition: Point = new Point(0, 0);
  private panStartClientPosition: Point = new Point(0, 0);
  private panStartImagePosition: Point = new Point(0, 0);
  private hasPanned: boolean = false;
  private hasRenderedImage: boolean = false;
  private renderRetryCount: number = 0;
  private suppressNextClick: boolean = false;
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
  constructor() {
  }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Initializes the currentPolygonVms array with polygons from imageInfo.
   * @throws Error if imageInfo.polygonVms is undefined.
   */
  ngOnInit(): void {
    // if (!this.imageInfo.polygonVms) {
    //   throw new Error('Polygon view models are not defined.');
    // }
  }

  /**
   * Lifecycle hook that is called after a component's view has been fully initialized.
   * Calls onDocumentLoaded to set up the image and polygons.
   */
  ngAfterViewInit(): void {
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
        this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
      }
      if (this.imgCanvas){
        this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
      }
    }
  }

  ngAfterViewChecked(): void {

  }

  /**
   * Handles the mouse wheel event to zoom in/out the image and polygons.
   * @param event The wheel event.
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault(); // Prevent the window from scrolling
    const zoomAnchor: Point | undefined = this.computeCanvasMousePosition(event);
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
      // this.currentPolygonVms = this.imageInfo.polygonVms;
      img.onload = () => {
        // this.clearCanvas(polygonCanvas); //clears the canvas
        // this.currentPolygonVms.forEach((p: PolygonViewModel) => {
        //   this.setupPolygonVms(p, polygonCanvas, this.imageInfo); // Set up each polygon view model
        //   if (p.objectClassVm){
        //     this.drawPolygon(polygonCanvas, p.scaledPoints, <Size>this.imageInfo.scaledSize, p.objectClassVm.color, 1.0, this.thickness, true); // Redraw with class color
        //   }else{
        //     this.drawPolygon(polygonCanvas, p.scaledPoints, <Size>this.imageInfo.scaledSize, p.color, 1.0, this.thickness); // Draw each polygon
        //   }
        // });
        this.isPanning = false;
        this.hasRenderedImage = false;
        this.renderRetryCount = 0;
        requestAnimationFrame(() => this.zoom(this.imageInfo.zoomLevel));
      };
      img.src = this.imageInfo.imageUrls.jpg; // Set the image source URL
    }
  }

  private syncCanvasSize(): boolean {
    if (!this.parent || !this.imgCanvas || !this.polygonCanvas) return false;
    const rect: DOMRect = this.parent.nativeElement.getBoundingClientRect();
    const width: number = Math.max(0, Math.round(rect.width));
    const height: number = Math.max(0, Math.round(rect.height));
    if (width === 0 || height === 0) return false;

    [this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement].forEach((canvas: HTMLCanvasElement) => {
      if (canvas.width !== width) {
        canvas.width = width;
      }
      if (canvas.height !== height) {
        canvas.height = height;
      }
    });
    return true;
  }

  /**
   * Computes the zoom parameters including image position and size.
   * @param image The image element.
   * @param zoomPer The zoom percentage.
   * @returns An object containing the image position and size.
   */
  computeZoomParameters(image: HTMLImageElement, zoomPer: number): { imagePosition: Point, imageSize: Size } {
    const zoomFactor: number = zoomPer / 100;
    const newWidth: number = image.naturalWidth / zoomFactor;
    const newHeight: number = image.naturalHeight / zoomFactor;
    const dx: number = (image.naturalWidth - newWidth) / 2;
    const dy: number = (image.naturalHeight - newHeight) / 2;
    const imagePosition = new Point(dx, dy);
    const imageSize = new Size(newWidth, newHeight);
    return {imagePosition, imageSize}; // Return the calculated image position and size
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private clampImagePosition(position: Point, imageSize: Size): Point {
    if (!this.image) return position;
    const maxX = Math.max(0, this.image.naturalWidth - imageSize.width);
    const maxY = Math.max(0, this.image.naturalHeight - imageSize.height);
    return new Point(
      this.clamp(position.x, 0, maxX),
      this.clamp(position.y, 0, maxY)
    );
  }

  private computeCanvasMousePosition(event: MouseEvent): Point | undefined {
    if (!this.polygonCanvas) return undefined;
    const rect: DOMRect = this.polygonCanvas.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;
    return new Point(
      this.clamp(event.clientX - rect.left, 0, rect.width),
      this.clamp(event.clientY - rect.top, 0, rect.height)
    );
  }

  private computeAnchoredImagePosition(zoomPer: number, anchorCanvasPosition?: Point): Point | undefined {
    if (!this.image) return undefined;
    if (!this.hasRenderedImage) return undefined;
    const rect: DOMRect = this.polygonCanvas.nativeElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;

    const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(this.image, zoomPer);
    const nextImageSize: Size = imgParams.imageSize;
    const anchorPosition: Point = anchorCanvasPosition ?? new Point(rect.width / 2, rect.height / 2);
    const anchorXRatio: number = anchorPosition.x / rect.width;
    const anchorYRatio: number = anchorPosition.y / rect.height;
    const sourceAnchor = new Point(
      this.imagePosition.x + anchorXRatio * this.imageInfo.scaledSize.width,
      this.imagePosition.y + anchorYRatio * this.imageInfo.scaledSize.height
    );
    return this.clampImagePosition(
      new Point(
        sourceAnchor.x - anchorXRatio * nextImageSize.width,
        sourceAnchor.y - anchorYRatio * nextImageSize.height
      ),
      nextImageSize
    );
  }

  /**
   * Clears the specified canvas.
   * @param canvas The canvas element to clear.
   */
  clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
  }

  /**
   * Displays the image on the specified canvas with the given zoom percentage.
   * @param image The image element.
   * @param canvas The canvas element.
   * @param zoomPer The zoom percentage.
   */
  displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number, imagePosition?: Point): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(image, zoomPer);
    const drawPosition: Point = this.clampImagePosition(imagePosition ?? imgParams.imagePosition, imgParams.imageSize);
    const imageSize: Size = imgParams.imageSize;
    if (imageSize.width <= 0 || imageSize.height <= 0 || canvas.width === 0 || canvas.height === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing the image

    // Draw the image zoomed and centered
    ctx.drawImage(image, drawPosition.x, drawPosition.y, imageSize.width, imageSize.height, 0, 0, canvas.width, canvas.height);
  }

  /**
   * Draws a polygon on the specified canvas.
   * @param canvas The canvas element.
   * @param points The points defining the polygon.
   * @param imageSize The size of the image.
   * @param colorHex The color of the polygon.
   * @param opacity The opacity of the polygon.
   * @param thickness The thickness of the polygon border.
   * @param fill Whether to fill the polygon.
   * @param zoomLevel The zoom level.
   */
  drawPolygon(canvas: HTMLCanvasElement, points: Point[], imageSize: Size, colorHex: string, opacity: number = 1.0,
              thickness: number, fill: boolean = false, zoomLevel: number = 100): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const opacityHex: string = Utils.convertOpacityToHex(opacity);
    const scaledPoints = points.map(point => ({
      x: (point.x / imageSize.width) * canvas.width,
      y: (point.y / imageSize.height) * canvas.height
    }));

    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    scaledPoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = colorHex + opacityHex; // Set fill style with opacity
      ctx.fill();
    }
    ctx.strokeStyle = colorHex //+ opacityHex; // Set stroke style with opacity
    ctx.lineWidth = thickness;
    ctx.stroke();
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
      this.clearCanvas(canvas);
      for (let p of this.currentPolygonVms) {
        this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
        p.drawPolygon();
      }
    };

    polygonVm.onDrawPolygon = () => {
      if (polygonVm.objectClassVm){
        // Fill polygon with object class color.
        this.clearPolygonFill(canvas, polygonVm.scaledPoints); // Clear the fill
        this.drawPolygon(canvas, polygonVm.scaledPoints, imageInfo.scaledSize, polygonVm.objectClassVm.color,
          0.6, this.thickness, true); // Redraw with class color
      }else{
        if (polygonVm.mouseOver){
          // Fill polygon when mouse over.
          this.clearPolygonFill(canvas, polygonVm.scaledPoints); // Clear the fill
          this.drawPolygon(canvas, polygonVm.scaledPoints, imageInfo.scaledSize, polygonVm.color,
            0.4, this.thickness, true); // Draw with hover effect
        }else{
          // Set polygon stroke color with no fill
          this.clearPolygonFill(canvas, polygonVm.scaledPoints); // Clear the fill
          this.drawPolygon(canvas, polygonVm.scaledPoints, imageInfo.scaledSize, polygonVm.color,
            1.0, this.thickness, false); // Redraw without fill
        }
      }
    };
    return polygonVm;
  }

  /**
   * Clears the fill of a specific polygon on the canvas.
   * @param canvas The canvas element.
   * @param points The points defining the polygon.
   */
  clearPolygonFill(canvas: HTMLCanvasElement, points: Point[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!this.imageInfo) return;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scaleX = canvasWidth / this.imageInfo.scaledSize.width;
    const scaleY = canvasHeight / this.imageInfo.scaledSize.height;

    const scaledPoints = points.map(point => ({
      x: point.x * scaleX,
      y: point.y * scaleY
    }));

    ctx.save(); // Save the current drawing state
    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    scaledPoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.clip(); // Clip to the polygon path

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the clipped area
    ctx.restore(); // Restore the previous drawing state
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
    const clampedZoom: number = this.clamp(zoomPer, 100, 1000);
    const imagePosition: Point | undefined = this.computeAnchoredImagePosition(clampedZoom, anchorCanvasPosition);
    this.imageInfo.zoomLevel = clampedZoom;
    this.renderImageAndPolygons(clampedZoom, imagePosition);
  }

  private renderImageAndPolygons(zoomPer: number, imagePosition?: Point): void {
    if (!this.image) return;
    if (!this.syncCanvasSize()) {
      if (this.renderRetryCount < 10) {
        this.renderRetryCount++;
        requestAnimationFrame(() => this.renderImageAndPolygons(zoomPer, imagePosition));
      }
      return;
    }
    this.renderRetryCount = 0;
    const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(this.image, zoomPer);
    const imgPos: Point = this.clampImagePosition(imagePosition ?? imgParams.imagePosition, imgParams.imageSize);
    const imgSize: Size = imgParams.imageSize;
    this.imagePosition = imgPos;
    this.imageInfo.scaledSize = imgSize;
    this.displayImage(this.image, this.imgCanvas.nativeElement, zoomPer, imgPos); // Display the zoomed image
    this.hasRenderedImage = true;
    this.clearCanvas(this.polygonCanvas.nativeElement); // Clear the canvas before redrawing polygons
    this.currentPolygonVms = [];

    if (!this.imageInfo.polygonVms) return;

    const croppedPolygons: PolygonViewModel[] = Utils.cropPolygons(this.imageInfo.polygonVms, imgPos, imgSize);
    this.currentPolygonVms = croppedPolygons;

    croppedPolygons.forEach((p: PolygonViewModel) => {
      p.scaledPoints = Utils.computeNewDisplayPoints(p.truePoints, imgPos, imgSize); // Compute new display points based on zoom/pan
      // p.scaledPoints = Utils.computeBboxPoints(p.truePoints, imgPos, imgSize);
      this.setupPolygonVms(p, this.polygonCanvas.nativeElement, this.imageInfo);
      p.drawPolygon();
    });
  }

  onPanStart(event: MouseEvent): void {
    if (event.button !== 0 || !this.image) return;
    event.preventDefault();
    this.isPanning = true;
    this.hasPanned = false;
    this.panStartClientPosition = new Point(event.clientX, event.clientY);
    this.panStartImagePosition = new Point(this.imagePosition.x, this.imagePosition.y);
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.panImage(event);
      return;
    }
    this.onCanvasHover(event);
  }

  private panImage(event: MouseEvent): void {
    if (!this.image) return;
    if (event.buttons === 0) {
      this.onPanEnd(event);
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
    const scaleX: number = this.imageInfo.scaledSize.width / rect.width;
    const scaleY: number = this.imageInfo.scaledSize.height / rect.height;
    const nextImagePosition = new Point(
      this.panStartImagePosition.x - dx * scaleX,
      this.panStartImagePosition.y - dy * scaleY
    );
    this.renderImageAndPolygons(this.imageInfo.zoomLevel, nextImagePosition);
  }

  onPanEnd(event: MouseEvent): void {
    if (!this.isPanning) return;
    event.preventDefault();
    this.isPanning = false;
    if (this.hasPanned && event.type === 'mouseup') {
      this.suppressNextClick = true;
    }
  }

  /**
   * Checks if a point is inside a polygon using the ray casting algorithm.
   * @param x The x-coordinate of the point.
   * @param y The y-coordinate of the point.
   * @param points The points defining the polygon.
   * @returns True if the point is inside the polygon, false otherwise.
   */
  isPointInsidePolygon(x: number, y: number, points: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi: number = points[i].x;
      const yi: number = points[i].y;
      const xj: number = points[j].x;
      const yj: number = points[j].y;
      const intersect: boolean = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside; // Return whether the point is inside the polygon
  }

  /**
   * Computes the hover coordinates relative to the canvas.
   * @param event The mouse event.
   * @param imageSize The size of the image.
   * @param rect The bounding rectangle of the canvas.
   * @returns The hover coordinates as a Point object.
   */
  private computeHoverCoordinates(event: MouseEvent, imageSize: Size, rect: DOMRect): Point {
    const x: number = (event.clientX - rect.left) * (this.imageInfo.scaledSize.width / rect.width);
    const y: number = (event.clientY - rect.top) * (this.imageInfo.scaledSize.height / rect.height);
    return new Point(x, y); // Return the computed hover coordinates
  }

  /**
   * Handles the canvas click event to detect clicks inside polygons.
   * @param event The mouse event.
   */
  onCanvasClicked(event: MouseEvent): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
    const canvas = event.target as HTMLCanvasElement;
    const rect: DOMRect = canvas.getBoundingClientRect();
    const hPosition = this.computeHoverCoordinates(event, this.imageInfo.scaledSize, rect);

    // Check each polygon to see if the click is inside it
    let polygon: PolygonViewModel | undefined;
    this.currentPolygonVms.forEach((p: PolygonViewModel) => {
      if (this.isPointInsidePolygon(hPosition.x, hPosition.y, p.scaledPoints)) {
        // if (p.onClick) {
        polygon = p;
        // }
      }
    });
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
    const hPosition = this.computeHoverCoordinates(event, this.imageInfo.scaledSize, rect);

    // Check each polygon to see if the mouse is over it
    let polygon: PolygonViewModel | undefined;
    this.currentPolygonVms.forEach((p) => {
      if (this.isPointInsidePolygon(hPosition.x, hPosition.y, p.scaledPoints)) {
        polygon = p;
      }
    });
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

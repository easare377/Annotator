import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Output,
  OnInit,
  ViewChild,
  EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import {PolygonViewModel} from "../../models/polygon-view-model";
import {Utils} from "../utils";
import {Size} from "../../models/size";
import {Point} from "../../models/point";
import {ImageInfo} from "../../models/image-info";

/**
 * Component to display and interact with multiple polygons overlaid on an image.
 */
@Component({
  selector: 'app-multi-polygon',
  templateUrl: './multi-polygon.component.html',
  styleUrl: './multi-polygon.component.css'
})
export class MultiPolygonComponent implements OnInit, AfterViewInit, OnChanges {
  private zoomLevel: number = 100; // Initial zoom level
  private image: HTMLImageElement | undefined; // Image element
  private currentPolygonVms!: PolygonViewModel[]; // Array to hold current polygon view models

  @ViewChild('imgCanvas') imgCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the image canvas
  @ViewChild('polygonCanvas') polygonCanvas!: ElementRef<HTMLCanvasElement>; // Reference to the polygon canvas

  /**
   * Thickness of the polygon borders in pixels.
   */
  @Input() thickness: number = 1;

  /**
   * Information about the image and the polygons to be displayed.
   */
  @Input() imageInfo!: ImageInfo;

  /**
   * Factor by which the image and polygons should be zoomed in/out.
   */
  @Input() zoomFactor: number = 1;

  /**
   * Event emitted when a polygon is clicked.
   */
  @Output() polygonClicked = new EventEmitter<PolygonViewModel>();

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
    if (!this.imageInfo.polygonVms) {
      throw new Error('Polygon view models are not defined.');
    }
    this.currentPolygonVms = this.imageInfo.polygonVms;
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
      const previousValue = changes['imageInfo'].previousValue;
      const currentValue = changes['imageInfo'].currentValue;
      this.onDocumentLoaded(this.imgCanvas.nativeElement, this.polygonCanvas.nativeElement);
    }
  }

  /**
   * Handles the mouse wheel event to zoom in/out the image and polygons.
   * @param event The wheel event.
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault(); // Prevent the window from scrolling
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
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
    img.onload = () => {
      this.displayImage(img, imgCanvas, 100); // Display the image on the canvas with default zoom level
      this.currentPolygonVms.forEach((p: PolygonViewModel) => {
        this.setupPolygonVms(p, polygonCanvas, this.imageInfo); // Set up each polygon view model
        this.drawPolygon(polygonCanvas, p.scaledPoints, <Size>this.imageInfo.scaledSize, p.color, 1, this.thickness); // Draw each polygon
      });
    };
    img.src = this.imageInfo.imageUrl; // Set the image source URL
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
  displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(image, zoomPer);
    const imagePosition: Point = imgParams.imagePosition;
    const imageSize: Size = imgParams.imageSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing the image

    // Draw the image zoomed and centered
    ctx.drawImage(image, imagePosition.x, imagePosition.y, imageSize.width, imageSize.height, 0, 0, canvas.width, canvas.height);
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
    ctx.strokeStyle = colorHex + opacityHex; // Set stroke style with opacity
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
  setupPolygonVms(polygonVm: PolygonViewModel, canvas: HTMLCanvasElement, imageInfo: ImageInfo): PolygonViewModel {
    polygonVm.onClick = () => {
      this.polygonClicked.emit(polygonVm); // Emit the polygonClicked event when the polygon is clicked
    };
    polygonVm.onClassSet = () => {
      if (polygonVm.objectClassVm) {
        this.clearPolygonFill(canvas, polygonVm.scaledPoints); // Clear the previous fill
        this.drawPolygon(canvas, polygonVm.scaledPoints, imageInfo.scaledSize, polygonVm.objectClassVm.color, 1.0, this.thickness, true); // Draw the polygon with new class color
      }
    };
    polygonVm.onMouseOver = () => {
      for (let p of this.currentPolygonVms){
        if (p.objectClassVm) {
          this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
          this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.objectClassVm.color, 1.0, this.thickness, true); // Redraw with class color
        } else {
          if (p !== polygonVm) {
            // if (p.mouseOver || Utils.bBoxIntercepts(p.bbox, polygonVm.bbox)) {
            this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
            this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.color, 0, this.thickness, false); // Redraw without fill
            p.mouseOver = false;
            // console.log('intercepts');
            // }
          } else {
            // this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
            this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.color, 0.4, this.thickness, true); // Draw with hover effect
          }
        }
      }
      // this.currentPolygonVms.forEach((p: PolygonViewModel) => {
      //   if (p.objectClassVm) {
      //     this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
      //     this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.objectClassVm.color, 1.0, this.thickness, true); // Redraw with class color
      //   } else {
      //     if (p !== polygonVm) {
      //       // if (p.mouseOver || Utils.bBoxIntercepts(p.bbox, polygonVm.bbox)) {
      //       //   this.clearPolygonFill(canvas, p.scaledPoints); // Clear the fill
      //         this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.color, 0, this.thickness, false); // Redraw without fill
      //         p.mouseOver = false;
      //         // console.log('intercepts');
      //       // }
      //     } else {
      //       this.drawPolygon(canvas, p.scaledPoints, imageInfo.scaledSize, p.color, 0.4, this.thickness, true); // Draw with hover effect
      //     }
      //   }
      // });
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
  zoomIn(): void {
    this.zoomLevel += this.zoomFactor;
    this.zoom(this.zoomLevel); // Apply the new zoom level
  }

  /**
   * Zooms out the image and polygons by the specified zoom factor.
   */
  zoomOut(): void {
    this.zoomLevel -= this.zoomFactor;
    this.zoom(this.zoomLevel); // Apply the new zoom level
  }

  /**
   * Applies the specified zoom percentage to the image and polygons.
   * @param zoomPer The zoom percentage.
   */
  zoom(zoomPer: number): void {
    if (this.image && this.imageInfo.polygonVms) {
      const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(this.image, zoomPer);
      const imgPos: Point = imgParams.imagePosition;
      const imgSize: Size = imgParams.imageSize;
      this.imageInfo.scaledSize = imgSize;
      this.displayImage(this.image, this.imgCanvas.nativeElement, this.zoomLevel); // Display the zoomed image
      const croppedPolygons: PolygonViewModel[] = Utils.cropPolygons(this.imageInfo.polygonVms, imgPos, imgSize);
      this.currentPolygonVms = croppedPolygons;
      this.clearCanvas(this.polygonCanvas.nativeElement); // Clear the canvas before redrawing polygons

      croppedPolygons.forEach((p: PolygonViewModel) => {
        p.scaledPoints = Utils.computeNewDisplayPoints(p.truePoints, imgPos, imgSize); // Compute new display points based on zoom
        if (p.objectClassVm) {
          this.clearPolygonFill(this.polygonCanvas.nativeElement, p.scaledPoints); // Clear the fill
          this.drawPolygon(this.polygonCanvas.nativeElement, p.scaledPoints, imgSize, p.objectClassVm.color, 1.0, this.thickness, true); // Redraw with class color
        } else {
          this.drawPolygon(this.polygonCanvas.nativeElement, p.scaledPoints, imgSize, p.color, 1, this.thickness, false); // Redraw without fill
        }
      });
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
        // if (!p.mouseOver) {
        // if (p.onMouseOver) {
        // p.onMouseOver();
        polygon = p;
        // }
        // }
      }
    });
    if (polygon && !polygon.mouseOver && polygon.onMouseOver) {
      polygon.mouseOver = true;
      polygon.onMouseOver();// Call the polygon's onMouseOver function if the mouse is over it
    }
  }

}

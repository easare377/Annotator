import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  Output,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  EventEmitter
} from '@angular/core';
import {PolygonViewModel} from "../../models/polygon-view-model";
import {HttpService} from "../http.service";
import {Utils} from "../utils";

@Component({
  selector: 'app-multi-polygon',
  templateUrl: './multi-polygon.component.html',
  styleUrl: './multi-polygon.component.css'
})
export class MultiPolygonComponent implements AfterViewInit {
  // @ViewChild('canvas', { static: false , read: ElementRef}) canvasRef: ElementRef | undefined;
  @ViewChild('imgCanvas') imgCanvas!: ElementRef<HTMLCanvasElement>;
  // @ViewChild('canvas') imgCanvas!: ElementRef<HTMLCanvasElement>;
  //   private canvasRef!: HTMLCanvasElement;
  @ViewChild('parent', {static: true}) parentRef: ElementRef<HTMLDivElement> | undefined;
  // private context: CanvasRenderingContext2D | null | undefined;
  // public isBrowser: boolean = false;
  // @Input() color: string = '#FF0000FF'; // Default color is black
  @Input() thickness: number = 3; // Default thickness is 1 pixel
  @Input() polygonVms: Array<PolygonViewModel>;
  @Input() imageUrl: string | undefined;
  @Input() imageWidth = 3830;
  @Input() imageHeight = 1822;
  @Output() polygonClicked = new EventEmitter<PolygonViewModel>();

  constructor(@Inject(PLATFORM_ID) public platformId: Object, private httpService: HttpService) {
    this.polygonVms = new Array<PolygonViewModel>();
  }


  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.onDocumentLoaded(this.imgCanvas.nativeElement, undefined);
  }

  onDocumentLoaded(imgCanvas: HTMLCanvasElement, polygonCanvas: HTMLCanvasElement | undefined): void {
    console.log("loaded");
    const img: HTMLImageElement = new Image();
    img.onload = () => {
      this.displayImage(img, imgCanvas, 400);
      console.log("display")
    };
    img.src = 'http://localhost:4200/assets/images/Fort.jpg';
  }

  // displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number): void {
  //   const imgWidth: number = image.naturalWidth;
  //   const imgHeight: number = image.naturalHeight;
  //   const newWidth: number = image.width / zoomPer;
  //   const newHeight: number = image.height / zoomPer;
  //   const x:number = (newWidth - imgWidth) / 2;
  //   const y:number = (newHeight - imgHeight) / 2;
  //   const ctx :CanvasRenderingContext2D | null = canvas.getContext('2d');
  //   // Draw the cropped image on the canvas
  //   ctx?.drawImage(image, x, y, newWidth, newHeight, 0, 0, newWidth, newHeight);
  // }

  // displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number): void {
  //   const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  //   if (!ctx) return;
  //
  //   // Set canvas size to image size for simplicity
  //   // canvas.width = image.naturalWidth;
  //   // canvas.height = image.naturalHeight;
  //   const imageWidth = image.naturalWidth;
  //   const imageHeight = image.naturalHeight;
  //   // Calculate the zoomed dimensions
  //   const zoomFactor = zoomPer / 100;
  //   const newWidth: number = image.naturalWidth * zoomFactor;
  //   const newHeight: number = image.naturalHeight * zoomFactor;
  //
  //   // Calculate the position to center the zoomed image
  //   const dx: number = (imageWidth - newWidth) / 2;
  //   const dy: number = (imageHeight - newHeight) / 2;
  //
  //   // Clear the canvas
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //
  //   // Draw the image zoomed and centered
  //   ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, dx, dy, newWidth, newHeight);
  // }

  displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Image dimensions and zoom factor
    const zoomFactor = zoomPer / 100;
    const zoomedWidth = image.naturalWidth * zoomFactor;
    const zoomedHeight = image.naturalHeight * zoomFactor;

    // Calculate the scaling needed to fit the image within the canvas
    const scaleWidth = canvasWidth / zoomedWidth;
    const scaleHeight = canvasHeight / zoomedHeight;
    const scale = Math.min(scaleWidth, scaleHeight);

    // Calculate final dimensions after scaling
    const finalWidth = zoomedWidth * scale;
    const finalHeight = zoomedHeight * scale;

    // Calculate centered position
    const dx = (canvasWidth - finalWidth) / 2;
    const dy = (canvasHeight - finalHeight) / 2;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the image zoomed and centered
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, dx, dy, finalWidth, finalHeight);
  }


  // displayImage(img: HTMLImageElement, imgCanvas: HTMLCanvasElement): void {
  //   const ctx = imgCanvas.getContext('2d');
  //   if (!ctx) return; // Ensure the context is not null
  //
  //   // Adjust the canvas size to match the image size
  //   imgCanvas.width = img.naturalWidth;
  //   imgCanvas.height = img.naturalHeight;
  //
  //   // Clear the canvas
  //   ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  //
  //   // Draw the image
  //   ctx.drawImage(img, 0, 0);
  // }


  onCanvasLoaded(canvasRef: HTMLCanvasElement): void {
    this.getPolygonDataAsync(canvasRef).then(r => {
    });
  }

  async getPolygonDataAsync(canvas: HTMLCanvasElement): Promise<void> {
    const points: number[][][] = await this.httpService.getJsonDataAsync();
    if (points) {
      points.forEach((points: number[][]) => {
        const color: string = Utils.generateRandomColor();
        const polygonVm = new PolygonViewModel(Utils.generateUUID(), points, color);
        polygonVm.onClick = () => {
          this.polygonClicked.emit(polygonVm);
        }
        polygonVm.onMouseOver = () => {
          this.polygonVms.forEach((p: PolygonViewModel) => {
            if (p.objectClassVm) {
              this.clearPolygonFill(canvas, p);
              this.drawPolygon(canvas, p, p.objectClassVm.color, 1.0, this.thickness, true);
            } else {
              if (p !== polygonVm) {
                if (p.mouseOver) {
                  this.clearPolygonFill(canvas, p);
                  this.drawPolygon(canvas, p, p.color, 0, this.thickness, false);
                  p.mouseOver = false;
                }
              } else {
                this.drawPolygon(canvas, p, p.color, 0.4, this.thickness, true);
              }
            }
          });
        }
        this.polygonVms.push(polygonVm);
      });
    }

    this.polygonVms.forEach((polygon: PolygonViewModel) => {
      this.drawPolygon(canvas, polygon, polygon.color, 1, this.thickness);
    });
  }

  drawPolygon(canvas: HTMLCanvasElement, polygon: PolygonViewModel, colorHex: string, opacity: number = 1.0,
              thickness: number, fill: boolean = false): void {
    // const canvas: HTMLCanvasElement = this.canvasRef;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth: number = canvas.width;
    const canvasHeight: number = canvas.height;

    const scaleX: number = canvasWidth / this.imageWidth;
    const scaleY: number = canvasHeight / this.imageHeight;

    // Convert opacity to hex
    const opacityHex: string = Utils.convertOpacityToHex(opacity);

    // Scale points
    const scaledPoints = polygon.points.map(point => ({
      x: point[0] * scaleX,
      y: point[1] * scaleY
    }));

    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    scaledPoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();

    // Set fill style with opacity
    if (fill) {
      ctx.fillStyle = colorHex + opacityHex;  // Combine color and opacity
      ctx.fill();
    }
    // Set stroke style without modifying the color hex
    ctx.strokeStyle = colorHex + opacityHex;  // Color for the stroke with opacity
    ctx.lineWidth = thickness;
    ctx.stroke();
  }


  /**
   * Clears the fill of a specific polygon.
   */
  clearPolygonFill(canvas: HTMLCanvasElement, polygon: PolygonViewModel): void {
    // const canvas = this.canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;  //window.devicePixelRatio;
    const canvasHeight = canvas.height; // window.devicePixelRatio;

    const scaleX = canvasWidth / this.imageWidth;
    const scaleY = canvasHeight / this.imageHeight;

    // Scale points
    const scaledPoints = polygon.points.map(point => ({
      x: point[0] * scaleX,
      y: point[1] * scaleY
    }));

    // Create a polygon path
    ctx.save(); // Save the current drawing state
    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    scaledPoints.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.clip(); // Clip to the polygon path

    // Clear the clipped area
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore(); // Restore the previous drawing state
  }


  // Function to zoom in and out of images.
  zoom(value: number): void {
    // implementation

  }

  // Check if a point is inside a polygon using the ray casting algorithm
  isPointInsidePolygon(x: number, y: number, polygon: PolygonViewModel): boolean {
    const points = polygon.points;
    let inside = false;

    // Ray casting algorithm
    for (let i: number = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi: number = points[i][0];
      const yi: number = points[i][1];
      const xj: number = points[j][0];
      const yj: number = points[j][1];

      // Check if the point is on the edge of the polygon
      const intersect: boolean = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }


  onCanvasClicked(event: MouseEvent): void {
    // Get the click coordinates relative to the canvas
    // Use type assertion to cast the event target to HTMLCanvasElement
    const canvas = event.target as HTMLCanvasElement;
    const rect: DOMRect = canvas.getBoundingClientRect();
    // Get the hover coordinates relative to the canvas
    const x: number = (event.clientX - rect.left) * (this.imageWidth / rect.width);
    const y: number = (event.clientY - rect.top) * (this.imageHeight / rect.height);
    // loop through each polygon and call the onClick
    // if the point falls within the polygon.
    this.polygonVms.forEach((polygon: PolygonViewModel) => {
      if (this.isPointInsidePolygon(x, y, polygon)) {
        // If the click is inside the polygon, call its onClick function
        if (polygon.onClick) {
          polygon.onClick();
        }
      }
    });
  }

  onCanvasHover(event: MouseEvent): void {
    // const canvas = this.canvasRef;
    const canvas = event.target as HTMLCanvasElement;
    const rect: DOMRect = canvas.getBoundingClientRect();

    // Get the hover coordinates relative to the canvas
    const x: number = (event.clientX - rect.left) * (this.imageWidth / rect.width);
    const y: number = (event.clientY - rect.top) * (this.imageHeight / rect.height);

    // Check if the mouse is inside any polygon
    // let polygonFound = false;
    this.polygonVms.forEach((polygon) => {
      if (this.isPointInsidePolygon(x, y, polygon)) {
        if (!polygon.mouseOver) {
          polygon.mouseOver = true;
          if (polygon.onMouseOver) {
            polygon.onMouseOver();
          }
        }
      }
    });
  }
}

// import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Input } from '@angular/core';

// interface Point {
//   x: number;
//   y: number;
// }

// class Polygon {
//   points: Point[] = [];

//   constructor(private ctx: CanvasRenderingContext2D, public savedPolygons: Point[][] = []) {}

//   addPoint(p: Point) {
//     this.points.push({ x: p.x, y: p.y });
//   }

//   draw(scale: number, imageX: number, imageY: number) {
//     if (this.points.length === 0) return;
//     this.ctx.lineWidth = 2;
//     this.ctx.strokeStyle = 'blue';
//     this.ctx.beginPath();
//     this.ctx.moveTo(this.points[0].x * scale + imageX, this.points[0].y * scale + imageY);
//     this.points.forEach(p => this.ctx.lineTo(p.x * scale + imageX, p.y * scale + imageY));
//     this.ctx.closePath();
//     this.points.forEach(p => {
//       this.ctx.moveTo(p.x * scale + 4 + imageX, p.y * scale + imageY);
//       this.ctx.arc(p.x * scale + imageX, p.y * scale + imageY, 4, 0, Math.PI * 2);
//     });
//     this.ctx.stroke();
//   }

//   drawAllSavedPolygons(scale: number, imageX: number, imageY: number) {
//     this.savedPolygons.forEach(polygon => {
//       this.ctx.beginPath();
//       this.ctx.moveTo(polygon[0].x * scale + imageX, polygon[0].y * scale + imageY);
//       polygon.forEach(p => this.ctx.lineTo(p.x * scale + imageX, p.y * scale + imageY));
//       this.ctx.lineTo(polygon[0].x * scale + imageX, polygon[0].y * scale + imageY);
//       this.ctx.stroke();
//     });
//   }

//   closest(pos: Point, dist: number = 8): Point | undefined {
//     let minDist = dist * dist;
//     let closestPoint: Point | undefined;
//     this.points.forEach(p => {
//       let d2 = (pos.x - p.x) ** 2 + (pos.y - p.y) ** 2;
//       if (d2 < minDist) {
//         minDist = d2;
//         closestPoint = p;
//       }
//     });
//     return closestPoint;
//   }

//   saveCurrentPolygon() {
//     if (this.points.length > 2) {
//       this.savedPolygons.push([...this.points]);
//       console.log("saved ", this.savedPolygons);
//     }
//     this.points = [];
//   }

//   reset() {
//     this.points.pop();
//   }

//   contains(point: Point): Point[][] {
//     let x = point.x, y = point.y;
//     let result: Point[][] = [];

//     for (let k = 0; k < this.savedPolygons.length; k++) {
//       let inside = false;
//       const currentPoint: Point[] = this.savedPolygons[k];
//       for (let i = 0, j = currentPoint.length - 1; i < currentPoint.length; j = i++) {
//         let xi = currentPoint[i].x, yi = currentPoint[i].y;
//         let xj = currentPoint[j].x, yj = currentPoint[j].y;

//         let intersect = ((yi > y) !== (yj > y))
//           && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//         if (intersect) inside = !inside;
//       }

//       if (inside) {
//         result.push(currentPoint);
//       }
//     }
//     return result;
//   }
// }

// @Component({
//   selector: 'app-canvas-area-draw',
//   templateUrl: './canvas-area-draw.component.html',
//   styleUrls: ['./canvas-area-draw.component.css']
// })
// export class CanvasAreaDrawComponent implements AfterViewInit, OnInit {
//   @Input() name?: string;
//   @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
//   private ctx!: CanvasRenderingContext2D;
//   private currentpolygon!: Polygon;
//   private activePoint?: Point;
//   private dragging = false;
//   private mouse = { x: 0, y: 0, button: false, lx: 0, ly: 0, update: false, rectangles: false };
//   private image = new Image();
//   private imageLoaded = false;
//   private labelpointer = false;
//   private rectanglepointer = false;
//   private scale = 1.0;
//   private scaleMultiplier = 0.9;
//   private isPanning = false;
//   private startCoords = { x: 0, y: 0 };
//   private imageX = 0;
//   private imageY = 0;
//   private minScale = 0.5;
//   private maxScale = 4;

//   ngOnInit() { }

//   ngAfterViewInit(): void {
//     this.ctx = this.drawingCanvas.nativeElement.getContext('2d')!;
//     this.currentpolygon = new Polygon(this.ctx);
//     requestAnimationFrame(() => this.update());

//     // Add event listeners for panning and zooming
//     const canvas = this.drawingCanvas.nativeElement;
//     canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
//     canvas.addEventListener('mousedown', this.startPanning.bind(this));
//     canvas.addEventListener('mouseup', this.stopPanning.bind(this));
//     canvas.addEventListener('mousemove', this.panCanvas.bind(this));
//   }

//   mouseEvents(event: MouseEvent) {
//     if (this.labelpointer || !this.imageLoaded || this.isPanning) return;

//     const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
//     this.mouse.x = (event.clientX - rect.left - this.imageX) / this.scale;
//     this.mouse.y = (event.clientY - rect.top - this.imageY) / this.scale;
//     this.mouse.button = event.type === 'mousedown' ? true : event.type === 'mouseup' ? false : this.mouse.button;
//     this.mouse.update = true;
//     this.mouse.rectangles = false;

//     if (this.rectanglepointer) {
//       this.mouse.rectangles = true;
//       console.log("inside rect code");
//     }
//   }

//   update() {
//     if (this.mouse.update && !this.mouse.rectangles) {
//       this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
//       this.ctx.save();
//       this.ctx.translate(this.imageX, this.imageY);
//       this.ctx.scale(this.scale, this.scale);
//       this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
//       this.ctx.restore();

//       this.currentpolygon.drawAllSavedPolygons(this.scale, this.imageX, this.imageY);

//       if (!this.dragging) {
//         this.activePoint = this.currentpolygon.closest({ x: this.mouse.x, y: this.mouse.y });
//       }
//       if (this.activePoint && this.mouse.button && !this.isPanning) {
//         if (this.dragging) {
//           this.activePoint.x += this.mouse.x - this.mouse.lx;
//           this.activePoint.y += this.mouse.y - this.mouse.ly;
//           console.log(this.activePoint);
//         } else {
//           this.dragging = true;
//         }
//       } else if (!this.mouse.button) {
//         this.dragging = false;
//       } else if (!this.activePoint && this.mouse.button && !this.isPanning) {
//         this.currentpolygon.addPoint({ x: this.mouse.x, y: this.mouse.y });
//         this.mouse.button = false;
//       }
//       this.currentpolygon.draw(this.scale, this.imageX, this.imageY);
//       if (this.activePoint) {
//         this.drawCircle(this.activePoint, 'red', this.scale);
//       }
//       this.mouse.lx = this.mouse.x;
//       this.mouse.ly = this.mouse.y;
//       this.drawingCanvas.nativeElement.style.cursor = this.activePoint ? 'move' : 'crosshair';
//       this.mouse.update = false;
//       this.mouse.rectangles = false;
//     }

//     requestAnimationFrame(() => this.update());
//   }

//   drawCircle(pos: Point, color: string = 'red', scale: number, size: number = 8) {
//     this.ctx.strokeStyle = color;
//     this.ctx.beginPath();
//     this.ctx.arc(pos.x * scale + this.imageX, pos.y * scale + this.imageY, size * scale, 0, Math.PI * 2);
//     this.ctx.stroke();
//   }

//   onFileSelected(event: Event): void {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = e => {
//         this.image.onload = () => {
//           this.imageLoaded = true;
//           this.redrawCanvas();
//         };
//         this.image.src = e.target!.result as string;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   redrawCanvas() {
//     this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
//     this.ctx.save();
//     this.ctx.translate(this.imageX, this.imageY);
//     this.ctx.scale(this.scale, this.scale);
//     this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
//     this.ctx.restore();

//     this.currentpolygon.draw(this.scale, this.imageX, this.imageY);
//     this.currentpolygon.drawAllSavedPolygons(this.scale, this.imageX, this.imageY);
//   }

//   onClickButton() {
//     this.labelpointer = false;
//     this.rectanglepointer = false;
//     this.currentpolygon.saveCurrentPolygon();
//     this.redrawCanvas();
//   }

//   onReset() {
//     this.currentpolygon.reset();
//     this.redrawCanvas();
//   }

//   findpolygon() {
//     this.labelpointer = true;
//     this.rectanglepointer = false;
//   }

//   forLables(event: MouseEvent): void {
//     if (!this.labelpointer || !this.imageLoaded || this.rectanglepointer) return;

//     const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
//     const x = (event.clientX - rect.left - this.imageX) / this.scale;
//     const y = (event.clientY - rect.top - this.imageY) / this.scale;
//     const foundPolygons = this.currentpolygon.contains({ x, y });

//     if (foundPolygons.length) {
//       console.log('Found polygon:', foundPolygons);
//     } else {
//       console.log('No polygon found at this point.');
//     }
//   }

//   downloadCanvas(): void {
//     const canvas = this.drawingCanvas.nativeElement;
//     canvas.toBlob(blob => {
//       if (blob) {
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.download = 'my-canvas.png';
//         link.href = url;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//       } else {
//         console.error('Could not create blob from canvas');
//       }
//     }, 'image/png');
//   }

//   drawretangle() {
//     this.rectanglepointer = true;
//     this.labelpointer = false;
//   }

//   forRectangels(e: MouseEvent) {
//     if (this.labelpointer || !this.imageLoaded || !this.rectanglepointer) return;
//   }

//   zoomIn() {
//     this.scale = Math.min(this.scale / this.scaleMultiplier, this.maxScale);
//     this.redrawCanvas();
//   }

//   zoomOut() {
//     this.scale = Math.max(this.scale * this.scaleMultiplier, this.minScale);
//     this.redrawCanvas();
//   }

//   onMouseWheel(event: WheelEvent): void {
//     event.preventDefault();
//     const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
//     const offsetX = (event.clientX - rect.left - this.imageX) / this.scale;
//     const offsetY = (event.clientY - rect.top - this.imageY) / this.scale;
//     const delta = Math.sign(event.deltaY);
//     if (delta > 0) {
//       this.scale = Math.max(this.scale * this.scaleMultiplier, this.minScale);
//     } else {
//       this.scale = Math.min(this.scale / this.scaleMultiplier, this.maxScale);
//     }
//     this.imageX = offsetX - (offsetX - this.imageX) * this.scaleMultiplier;
//     this.imageY = offsetY - (offsetY - this.imageY) * this.scaleMultiplier;
//     this.enforceBounds();
//     this.redrawCanvas();
//   }

//   startPanning(event: MouseEvent): void {
//     this.isPanning = true;
//     this.startCoords = { x: event.clientX - this.imageX, y: event.clientY - this.imageY };
//   }

//   stopPanning(): void {
//     this.isPanning = false;
//   }

//   enforceBounds(): void {
//     const minX = this.drawingCanvas.nativeElement.width - this.image.width * this.scale;
//     const minY = this.drawingCanvas.nativeElement.height - this.image.height * this.scale;
//     this.imageX = Math.min(Math.max(this.imageX, minX), 0);
//     this.imageY = Math.min(Math.max(this.imageY, minY), 0);
//   }

//   panCanvas(event: MouseEvent): void {
//     if (this.isPanning) {
//       this.imageX = event.clientX - this.startCoords.x;
//       this.imageY = event.clientY - this.startCoords.y;
//       this.enforceBounds();
//       this.redrawCanvas();
//     }
//   }
// }
import { Component } from '@angular/core';
import {ElementRef, ViewChild, AfterViewInit, Input, OnDestroy, NgZone,OnChanges } from '@angular/core';

  interface Point {
    x: number;
    y: number;
  }
  
  class Polygon {
    points: Point[] = [];
  
    constructor(private ctx: CanvasRenderingContext2D,public savedPolygons: Point[][] = []) {}
  
    addPoint(p: Point) {
      this.points.push({ x: p.x, y: p.y });
    }
  
    draw() {
      if (this.points.length === 0) return;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'blue';
      this.ctx.beginPath();
      this.ctx.moveTo(this.points[0].x, this.points[0].y);
      this.points.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.closePath();
      this.points.forEach(p => {
        this.ctx.moveTo(p.x + 4, p.y);
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      });
      this.ctx.stroke();
    }
  
  
    closest(pos: Point, dist: number = 8): Point | undefined {
      let minDist = dist * dist;
      let closestPoint: Point | undefined;
      this.points.forEach(p => {
        let d2 = (pos.x - p.x) ** 2 + (pos.y - p.y) ** 2;
        if (d2 < minDist) {
          minDist = d2;
          closestPoint = p;
        }
      });
      return closestPoint;
    }
      saveCurrentPolygon() {
    if (this.points.length > 2) {  // Ensure the polygon is meaningful
      this.savedPolygons.push([...this.points]);
      console.log("saved ", this.savedPolygons)
    }
    this.points = [];  // Clear current points to start a new polygon
  }

  drawAllSavedPolygons() {
    this.savedPolygons.forEach(polygon => {
      this.ctx.beginPath();
      this.ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.lineTo(polygon[0].x, polygon[0].y); // Close the polygon
      this.ctx.stroke();
    });
  }
    reset() {
    // this.savedPolygons = [];
    this.points.pop();
  }
    contains(point: Point): Point[][] {
    let x = point.x, y = point.y;
    // let inside = false;

    let result : Point[][] = []

    for(let k = 0; k < this.savedPolygons.length; k++) {
      let inside = false;
      const currentPoint: Point[] = this.savedPolygons[k];
      for (let i = 0, j = currentPoint.length - 1; i < currentPoint.length; j = i++) {
        let xi = currentPoint[i].x, yi = currentPoint[i].y;
        let xj = currentPoint[j].x, yj = currentPoint[j].y;
  
        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }

      if(inside) {
        result.push(currentPoint);
      }
        

    }
    return result;
  }
  }
  
  @Component({
    selector: 'app-canvas-area-draw',
    templateUrl: './canvas-area-draw.component.html',
    styleUrl: './canvas-area-draw.component.css'
  })
  export class CanvasAreaDrawComponent implements AfterViewInit{
    @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private currentpolygon!: Polygon;
    private activePoint?: Point;
    private dragging = false;
    private mouse = { x: 0, y: 0, button: false, lx: 0, ly: 0, update: false };
    // private currentpolygon!: Polygon;
    private image = new Image();
    private imageLoaded = false;
    private labelpointer=false;
    points: Point[] = [];
    // width:number=0
    // height:number=0


  
    ngAfterViewInit(): void {
      this.ctx = this.drawingCanvas.nativeElement.getContext('2d')!;
      this.currentpolygon = new Polygon(this.ctx);
      requestAnimationFrame(() => this.update());
    }
  
    mouseEvents(event: MouseEvent) {
      if(this.labelpointer)return;
      const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left ;
      this.mouse.y = event.clientY - rect.top ;
      this.mouse.button = event.type === 'mousedown' ? true : event.type === 'mouseup' ? false : this.mouse.button;
      this.mouse.update = true;
    }
  
    update() {
      // if (this.mouse.update) {
        if(true){
        // this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
        console.log(this.image.width)
        console.log(this.drawingCanvas.nativeElement.height)

        this.ctx.drawImage(this.image, 0, 0,this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height );
        
        // this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
        this.currentpolygon.drawAllSavedPolygons();
       
        if (!this.dragging) {
          this.activePoint = this.currentpolygon.closest({ x: this.mouse.x, y: this.mouse.y });
        }
        if (this.activePoint && this.mouse.button) {
          if (this.dragging) {
            this.activePoint.x += this.mouse.x - this.mouse.lx;
            this.activePoint.y += this.mouse.y - this.mouse.ly;
          } else {
            this.dragging = true;
          }
        } else if (!this.mouse.button) {
          this.dragging = false;
        } else if (!this.activePoint && this.mouse.button) {
          this.currentpolygon.addPoint({ x: this.mouse.x, y: this.mouse.y });
          this.mouse.button = false;
        }
        this.currentpolygon.draw();
        if (this.activePoint) {
          this.drawCircle(this.activePoint, 'red');
        }
        this.mouse.lx = this.mouse.x;
        this.mouse.ly = this.mouse.y;
        this.drawingCanvas.nativeElement.style.cursor = this.activePoint ? 'move' : 'crosshair';
        this.mouse.update = false;
      }

      requestAnimationFrame(() => this.update());
    }
  
    drawCircle(pos: Point, color: string = 'red', size: number = 8) {
      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    onFileSelected(event: Event): void {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = e => {
              this.image.onload = () => {
                this.imageLoaded = true;
                
                // this.width=this.image.width
                // this.height=this.image.height
                // console.log(this.width)
                // this.ctx.drawImage(this.image, 0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
                console.log(this.image.width)
                this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
              };
              this.image.src = e.target!.result as string;
            };
            reader.readAsDataURL(file);
          }
      
        }
  //   mouseClick(event: MouseEvent) {
  //   if (this.labelpointer) return;
  //   const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
  //   this.currentpolygon.points.push({
  //     x: event.clientX - rect.left,
  //     y: event.clientY - rect.top
  //   });
  //   this.redrawCanvas();
  // }

  redrawCanvas() {
    // this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    // this.ctx.drawImage(this.image, 0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    this.currentpolygon.drawAllSavedPolygons();  // Draw all saved polygons
    this.currentpolygon.draw();  // Draw the current polygon
 
  }

  onClickButton() {
    this.labelpointer=false
    this.currentpolygon.saveCurrentPolygon();

    this.redrawCanvas();
  }
  onReset() {
    this.currentpolygon.reset();
    this.redrawCanvas();
  }
  findpolygon(){
  this.labelpointer=true
} 
onMouseMove(event: MouseEvent): void {
  if(!this.labelpointer) return;
  if (!this.imageLoaded) return;
  const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
  const point: Point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
  };
  console.log(typeof point, point);

  const hoveredPolygon : Point[][] = this.currentpolygon.contains(point);
  console.log(hoveredPolygon);
  // this.redrawCanvas(hoveredPolygon);
}

  }


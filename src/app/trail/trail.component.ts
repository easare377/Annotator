import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

class Polygon {
  // Declare points only once and provide it through the constructor
  constructor(private ctx: CanvasRenderingContext2D, public points: Point[] = []) {}

  addPoint(p: Point) {
    this.points.push(p);
  }

  draw() {
    if (this.points.length === 0) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.closePath(); // Close the path
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

@Component({
  selector: 'app-trail',
  templateUrl: './trail.component.html',
  styleUrls: ['./trail.component.css']
})
export class TrailComponent implements AfterViewInit {
  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private polygon!: Polygon;
  private image = new Image();
  private drawing = false;

  ngAfterViewInit(): void {
    this.ctx = this.drawingCanvas.nativeElement.getContext('2d')!;
    this.polygon = new Polygon(this.ctx);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        this.image.onload = () => this.redrawCanvas();
        this.image.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  redrawCanvas() {
    this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    this.ctx.drawImage(this.image, 0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    this.polygon.draw();
  }

  onMouseDown(event: MouseEvent): void {
    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.drawing = true;
    this.polygon.points = [point]; // Start a new polygon
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.drawing) return;
    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.polygon.points.push(point);
    this.redrawCanvas();
  }

  onMouseUp(event: MouseEvent): void {
    this.drawing = false;
    this.polygon.draw(); // Optionally finalize the polygon drawing
  }
}

import {Injectable} from '@angular/core';
import {Point} from "../models/point";
import {Size} from "../models/size";
import {PolygonViewModel} from "../models/polygon-view-model";
import {Utils} from "../app/utils";
import {BBox} from "../models/bbox";
import {PromptsViewModel} from "../models/prompts-view-model";
import {PromptType} from "../models/enum/prompt-type";

@Injectable({
  providedIn: 'root'
})
export class PolygonCanvasRendererService {
  syncCanvasSize(container: HTMLElement, canvases: HTMLCanvasElement[]): boolean {
    const rect: DOMRect = container.getBoundingClientRect();
    const width: number = Math.max(0, Math.round(rect.width));
    const height: number = Math.max(0, Math.round(rect.height));
    if (width === 0 || height === 0) return false;
    const pixelRatio: number = this.getPixelRatio();
    const backingWidth: number = Math.max(1, Math.round(width * pixelRatio));
    const backingHeight: number = Math.max(1, Math.round(height * pixelRatio));

    canvases.forEach((canvas: HTMLCanvasElement) => {
      if (canvas.width !== backingWidth) {
        canvas.width = backingWidth;
      }
      if (canvas.height !== backingHeight) {
        canvas.height = backingHeight;
      }
    });
    return true;
  }

  computeZoomParameters(image: HTMLImageElement, zoomPer: number): { imagePosition: Point, imageSize: Size } {
    const zoomFactor: number = zoomPer / 100;
    const newWidth: number = image.naturalWidth / zoomFactor;
    const newHeight: number = image.naturalHeight / zoomFactor;
    const dx: number = (image.naturalWidth - newWidth) / 2;
    const dy: number = (image.naturalHeight - newHeight) / 2;
    return {
      imagePosition: new Point(dx, dy),
      imageSize: new Size(newWidth, newHeight)
    };
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  clampImagePosition(image: HTMLImageElement, position: Point, imageSize: Size): Point {
    const maxX = Math.max(0, image.naturalWidth - imageSize.width);
    const maxY = Math.max(0, image.naturalHeight - imageSize.height);
    return new Point(
      this.clamp(position.x, 0, maxX),
      this.clamp(position.y, 0, maxY)
    );
  }

  computeCanvasMousePosition(canvas: HTMLCanvasElement, event: MouseEvent): Point | undefined {
    const rect: DOMRect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;
    return new Point(
      this.clamp(event.clientX - rect.left, 0, rect.width),
      this.clamp(event.clientY - rect.top, 0, rect.height)
    );
  }

  computeAnchoredImagePosition(image: HTMLImageElement, canvas: HTMLCanvasElement, currentImagePosition: Point,
                               currentImageSize: Size, zoomPer: number, hasRenderedImage: boolean,
                               anchorCanvasPosition?: Point): Point | undefined {
    if (!hasRenderedImage) return undefined;
    const rect: DOMRect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;

    const nextImageSize: Size = this.computeZoomParameters(image, zoomPer).imageSize;
    const anchorPosition: Point = anchorCanvasPosition ?? new Point(rect.width / 2, rect.height / 2);
    const anchorXRatio: number = anchorPosition.x / rect.width;
    const anchorYRatio: number = anchorPosition.y / rect.height;
    const sourceAnchor = new Point(
      currentImagePosition.x + anchorXRatio * currentImageSize.width,
      currentImagePosition.y + anchorYRatio * currentImageSize.height
    );
    return this.clampImagePosition(
      image,
      new Point(
        sourceAnchor.x - anchorXRatio * nextImageSize.width,
        sourceAnchor.y - anchorYRatio * nextImageSize.height
      ),
      nextImageSize
    );
  }

  clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  displayImage(image: HTMLImageElement, canvas: HTMLCanvasElement, zoomPer: number, imagePosition?: Point): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const imgParams: { imagePosition: Point, imageSize: Size } = this.computeZoomParameters(image, zoomPer);
    const drawPosition: Point = this.clampImagePosition(image, imagePosition ?? imgParams.imagePosition, imgParams.imageSize);
    const imageSize: Size = imgParams.imageSize;
    if (imageSize.width <= 0 || imageSize.height <= 0 || canvas.width === 0 || canvas.height === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, drawPosition.x, drawPosition.y, imageSize.width, imageSize.height, 0, 0, canvas.width, canvas.height);
  }

  drawPolygon(canvas: HTMLCanvasElement, path: Path2D, imageSize: Size, colorHex: string, opacity: number = 1.0,
              thickness: number, fill: boolean = false): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    const opacityHex: string = Utils.convertOpacityToHex(opacity);
    const colorWithOpacity: string = colorHex.length === 7 ? colorHex + opacityHex : colorHex;
    const scaleX: number = canvas.width / imageSize.width;
    const scaleY: number = canvas.height / imageSize.height;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    if (fill) {
      ctx.fillStyle = colorWithOpacity;
      ctx.fill(path);
    }
    ctx.strokeStyle = colorWithOpacity;
    ctx.lineWidth = (thickness * this.getCanvasPixelRatio(canvas)) / Math.max(scaleX, scaleY);
    ctx.stroke(path);
    ctx.restore();
  }

  renderPolygon(canvas: HTMLCanvasElement, polygon: PolygonViewModel, imageSize: Size, thickness: number,
                clearFirst: boolean = true): void {
    const style = this.getPolygonStyle(polygon, thickness);
    if (clearFirst) {
      this.clearPolygonFill(canvas, polygon.displayPath, imageSize);
    }
    this.drawPolygon(canvas, polygon.displayPath, imageSize, style.color, style.opacity, style.thickness, style.fill);
  }

  renderPolygons(canvas: HTMLCanvasElement, polygons: PolygonViewModel[], imageSize: Size, thickness: number): void {
    this.clearCanvas(canvas);
    this.getRenderOrderedPolygons(polygons).forEach((polygon: PolygonViewModel) => {
      this.renderPolygon(canvas, polygon, imageSize, thickness, false);
    });
  }

  renderPrompts(canvas: HTMLCanvasElement, promptsVm: PromptsViewModel | undefined, imagePosition: Point,
                imageSize: Size, draftBbox?: BBox): void {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return;
    this.clearCanvas(canvas);
    if (imageSize.width <= 0 || imageSize.height <= 0) return;

    const scaleX: number = canvas.width / imageSize.width;
    const scaleY: number = canvas.height / imageSize.height;
    const pixelRatio: number = this.getCanvasPixelRatio(canvas);

    promptsVm?.bboxes.forEach((bbox: BBox) => {
      this.drawPromptBbox(ctx, bbox, imagePosition, scaleX, scaleY, pixelRatio, false);
    });
    if (draftBbox) {
      this.drawPromptBbox(ctx, draftBbox, imagePosition, scaleX, scaleY, pixelRatio, true);
    }
    promptsVm?.pointVms.forEach(pointVm => {
      const point: Point = pointVm.point;
      const x: number = (point.x - imagePosition.x) * scaleX;
      const y: number = (point.y - imagePosition.y) * scaleY;
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;
      const color: string = pointVm.pointType === PromptType.POSITIVE ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 6 * pixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * pixelRatio;
      ctx.stroke();
    });
  }

  clearPolygonFill(canvas: HTMLCanvasElement, path: Path2D, imageSize: Size): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scaleX: number = canvas.width / imageSize.width;
    const scaleY: number = canvas.height / imageSize.height;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.clip(path);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  getVisiblePolygons(polygons: PolygonViewModel[], position: Point, size: Size): PolygonViewModel[] {
    return Utils.cropPolygons(polygons, position, size);
  }

  computeDisplayPoints(points: Point[], position: Point, size: Size): Point[] {
    return Utils.computeNewDisplayPoints(points, position, size);
  }

  computePannedImagePosition(startImagePosition: Point, startClientPosition: Point, event: PointerEvent,
                             imageSize: Size, canvasRect: DOMRect): Point | undefined {
    if (canvasRect.width === 0 || canvasRect.height === 0) return undefined;
    const dx: number = event.clientX - startClientPosition.x;
    const dy: number = event.clientY - startClientPosition.y;
    const scaleX: number = imageSize.width / canvasRect.width;
    const scaleY: number = imageSize.height / canvasRect.height;
    return new Point(
      startImagePosition.x - dx * scaleX,
      startImagePosition.y - dy * scaleY
    );
  }

  computePointerImagePosition(event: MouseEvent, imageSize: Size, rect: DOMRect): Point {
    const x: number = (event.clientX - rect.left) * (imageSize.width / rect.width);
    const y: number = (event.clientY - rect.top) * (imageSize.height / rect.height);
    return new Point(x, y);
  }

  findPolygonAtPoint(canvas: HTMLCanvasElement, polygons: PolygonViewModel[], point: Point): PolygonViewModel | undefined {
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) return undefined;
    for (const p of this.getHitTestOrderedPolygons(polygons)) {
      if (this.isPointInsideBbox(point, p.displayBbox) && ctx.isPointInPath(p.displayPath, point.x, point.y)) {
        return p;
      }
    }
    return undefined;
  }

  getRenderOrderedPolygons(polygons: PolygonViewModel[]): PolygonViewModel[] {
    return this.orderPolygonsByDisplayArea(polygons, 'descending');
  }

  getHitTestOrderedPolygons(polygons: PolygonViewModel[]): PolygonViewModel[] {
    return this.orderPolygonsByDisplayArea(polygons, 'ascending');
  }

  private isPointInsideBbox(point: Point, bbox: BBox): boolean {
    return point.x >= bbox.xMin && point.x <= bbox.xMax && point.y >= bbox.yMin && point.y <= bbox.yMax;
  }

  private orderPolygonsByDisplayArea(polygons: PolygonViewModel[], direction: 'ascending' | 'descending'): PolygonViewModel[] {
    return polygons
      .map((polygon: PolygonViewModel, index: number) => ({polygon, index}))
      .sort((a, b) => {
        const areaDifference: number = a.polygon.displayArea - b.polygon.displayArea;
        if (areaDifference !== 0) {
          return direction === 'ascending' ? areaDifference : -areaDifference;
        }
        return direction === 'ascending' ? b.index - a.index : a.index - b.index;
      })
      .map(({polygon}) => polygon);
  }

  private getPolygonStyle(polygon: PolygonViewModel, baseThickness: number): { color: string, opacity: number, thickness: number, fill: boolean } {
    if (polygon.objectClassVm) {
      return {
        color: polygon.objectClassVm.color,
        opacity: polygon.dimmed ? 0.12 : polygon.mouseOver ? 0.82 : 0.6,
        thickness: polygon.dimmed ? 1 : polygon.mouseOver ? baseThickness + 2 : baseThickness,
        fill: true
      };
    }
    if (polygon.dimmed) {
      return {color: polygon.color, opacity: 0.12, thickness: 1, fill: false};
    }
    if (polygon.mouseOver) {
      return {color: polygon.color, opacity: 0.4, thickness: baseThickness, fill: true};
    }
    return {color: polygon.color, opacity: 1, thickness: baseThickness, fill: false};
  }

  private drawPromptBbox(ctx: CanvasRenderingContext2D, bbox: BBox, imagePosition: Point,
                         scaleX: number, scaleY: number, pixelRatio: number, draft: boolean): void {
    const x: number = (bbox.xMin - imagePosition.x) * scaleX;
    const y: number = (bbox.yMin - imagePosition.y) * scaleY;
    const width: number = (bbox.xMax - bbox.xMin) * scaleX;
    const height: number = (bbox.yMax - bbox.yMin) * scaleY;
    ctx.save();
    ctx.strokeStyle = '#1e90ff';
    ctx.fillStyle = draft ? 'rgba(30, 144, 255, 0.12)' : 'rgba(30, 144, 255, 0.08)';
    ctx.lineWidth = 2 * pixelRatio;
    ctx.setLineDash(draft ? [6 * pixelRatio, 4 * pixelRatio] : []);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }

  private getCanvasPixelRatio(canvas: HTMLCanvasElement): number {
    const rect: DOMRect = canvas.getBoundingClientRect();
    if (rect.width === 0) return this.getPixelRatio();
    return canvas.width / rect.width;
  }

  private getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  }
}

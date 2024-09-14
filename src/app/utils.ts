import {PolygonViewModel} from "../models/polygon-view-model";
import {Point} from "../models/point";
import {Size} from "../models/size";
import {BBox} from "../models/bbox";

export abstract class Utils {

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, // Get a random 0-15
        v = c === 'x' ? r : (r & 0x3 | 0x8); // Calculate 'y' value
      return v.toString(16);
    });
  }

  static generateRandomColor(): string {
    const letters: string = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Converts a decimal opacity value to a hexadecimal string.
   * @param opacity A decimal between 0.0 and 1.0.
   * @returns A two-character hexadecimal string.
   */
  static convertOpacityToHex(opacity: number): string {
    return Math.floor(opacity * 255).toString(16).padStart(2, '0');
  }

  static cropPolygons(polygons: PolygonViewModel[], position: Point, size: Size): PolygonViewModel[] {
    // Define the right and bottom boundaries of the rectangle
    const xMin: number = position.x;
    const yMin: number = position.y;
    const xMax: number = position.x + size.width;
    const yMax: number = position.y + size.height;
    const croppedPolygons: PolygonViewModel[] = [];
    // Function to check if a point is within the crop rectangle
    const isWithinCropArea = (polygon: PolygonViewModel): boolean => {
      const bbox: BBox = polygon.bbox;
      if (bbox.xMin > xMin || bbox.yMin > yMin || bbox.xMax < xMax || bbox.yMax) {
        return true;
      }
      return false;
    };
    polygons.forEach((p: PolygonViewModel) => {
      if (!isWithinCropArea(p)) {
        return;
      }
      // const croppedPoints = new Array<Point>
      // p.points.forEach((point: Point): void => {
      //   let pointX: number = point.x - position.x;
      //   let pointY: number = point.y - position.y;
      //   if (pointX < 0){
      //     pointX = 0;
      //   }
      //   if (pointY < 0){
      //     pointY = 0;
      //   }
      //   if (pointX > xMax){
      //     pointX = xMax;
      //   }
      //   if (pointY > yMax){
      //     pointY = yMax;
      //   }
      //   croppedPoints.push(new Point(pointX, pointY));
      // });
      // const newPolygonVm = new PolygonViewModel(p.id, croppedPoints, p.color);
      croppedPolygons.push(p);
    });
    return croppedPolygons;
  }

  static computeNewDisplayPoints(points: Point[], position: Point, size: Size): Array<Point> {
    // Define the right and bottom boundaries of the rectangle
    const xMin: number = position.x;
    const yMin: number = position.y;
    const xMax: number = position.x + size.width;
    const yMax: number = position.y + size.height;
    const croppedPoints = new Array<Point>
    points.forEach((point: Point): void => {
      let pointX: number = point.x - position.x;
      let pointY: number = point.y - position.y;
      if (pointX < 0) {
        pointX = 0;
      }
      if (pointY < 0) {
        pointY = 0;
      }
      if (pointX > xMax) {
        pointX = xMax;
      }
      if (pointY > yMax) {
        pointY = yMax;
      }
      croppedPoints.push(new Point(pointX, pointY));
    });
    return croppedPoints;
  }

  // static getBboxFromPoints(points: Point[], position: Point, size: Size): BBox {
  //
  // }

  static computeBbox(points: Array<Point>): BBox {
    let xMin: number = points[0].x;
    let xMax: number = points[0].x;
    let yMin: number = points[0].y;
    let yMax: number = points[0].y;
    points.forEach((point: Point) => {
      if (point.x < xMin) {
        xMin = point.x;
      }
      if (point.x > xMax) {
        xMax = point.x;
      }
      if (point.y < yMin) {
        yMin = point.y;
      }
      if (point.y > yMax) {
        yMax = point.y;
      }
    });
    return BBox.fromBbox(xMin, yMin, xMax, yMax);
  }

  static computeBboxPoints(points: Point[], position: Point, size: Size): Array<Point> {
    const croppedPoints = this.computeNewDisplayPoints(points, position, size)
    const bbox: BBox = this.computeBbox(croppedPoints);
    const bboxPoints: Point[] = [];
    bboxPoints.push(new Point(bbox.xMin, bbox.yMin));
    bboxPoints.push(new Point(bbox.xMax, bbox.yMin));
    bboxPoints.push(new Point(bbox.xMax, bbox.yMax));
    bboxPoints.push(new Point(bbox.xMin, bbox.yMax));
    return bboxPoints;
  }

  static polygonIntercepts(polygon1: PolygonViewModel, polygon2: PolygonViewModel): boolean {
    const polygons = [polygon1, polygon2];

    for (let i = 0; i < polygons.length; i++) {
      const polygon = polygons[i];
      const points = polygon.truePoints;

      for (let j = 0; j < points.length; j++) {
        const k = (j + 1) % points.length;
        const point1 = points[j];
        const point2 = points[k];

        // Get the axis perpendicular to the current edge
        const axisProj = {x: -(point2.y - point1.y), y: point2.x - point1.x};

        // Project both polygons onto the axis
        let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;

        for (let p = 0; p < polygon1.truePoints.length; p++) {
          const projected = axisProj.x * polygon1.truePoints[p].x + axisProj.y * polygon1.truePoints[p].y;
          if (minA === null || projected < minA) {
            minA = projected;
          }
          if (maxA === null || projected > maxA) {
            maxA = projected;
          }
        }

        for (let p = 0; p < polygon2.truePoints.length; p++) {
          const projected = axisProj.x * polygon2.truePoints[p].x + axisProj.y * polygon2.truePoints[p].y;
          if (minB === null || projected < minB) {
            minB = projected;
          }
          if (maxB === null || projected > maxB) {
            maxB = projected;
          }
        }

        // Check if projections are not overlapping
        if (maxA < minB || maxB < minA) {
          return false; // Separating axis found
        }
      }
    }
    return true; // No separating axis found, polygons intersect
  }

  static computePolygonArea(polygon: PolygonViewModel): number {
    const points: Point[] = polygon.truePoints;
    const n: number = points.length;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[i].y * points[j].x;
    }
    return Math.abs(area) / 2;
  }

  static sortPolygonsByArea(polygonVms: PolygonViewModel[]): PolygonViewModel[] {
    return polygonVms.sort((a, b) => {
      const areaA: number = Utils.computePolygonArea(a);
      const areaB: number = Utils.computePolygonArea(b);
      return areaB - areaA; // Sort in descending order
    });
  }

  static bBoxIntercepts(bBox1: BBox, bBox2: BBox): boolean {
    // Check if there is no overlap on the x-axis
    if (bBox1.xMax < bBox2.xMin || bBox1.xMin > bBox2.xMax) {
      return false;
    }
    // Check if there is no overlap on the y-axis
    if (bBox1.yMax < bBox2.yMin || bBox1.yMin > bBox2.yMax) {
      return false;
    }
    // If neither condition is met, the bounding boxes intersect
    return true;
  }

  static hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');
    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r: number = (bigint >> 16) & 255;
    let g: number = (bigint >> 8) & 255;
    let b: number = bigint & 255;
    return {r, g, b};
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    let max:number = Math.max(r, g, b);
    let min:number = Math.min(r, g, b);
    let h: number = 0, s: number, l: number = (max + min) / 2;
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {h, s, l};
  }

  static hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  static lightenColor(colorHex: string, lightness: number = 0.5): string {
    // Step 1: Convert Hex to RGB
    let {r, g, b} = Utils.hexToRgb(colorHex);
    // Step 2: Convert RGB to HSL
    let {h, s, l} = Utils.rgbToHsl(r, g, b);
    // Step 3: Adjust the lightness
    l = Math.min(1, l + lightness * (1 - l)); // Ensure lightness is within bounds
    // Step 4: Convert HSL back to RGB
    let {r: newR, g: newG, b: newB} = Utils.hslToRgb(h, s, l);
    // Step 5: Convert RGB back to Hex
    return Utils.rgbToHex(newR, newG, newB);
  }

  static getFilenameFromUrl(url: string): string {
    if (!url) {
      throw new Error('URL must be provided');
    }
    // Create a URL object to parse the URL
    const parsedUrl = new URL(url);
    // Extract the pathname (which includes the filename)
    const pathname = parsedUrl.pathname;
    // Use the last segment of the pathname as the filename
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    // Return the filename or null if not found
    return filename;
  }

}

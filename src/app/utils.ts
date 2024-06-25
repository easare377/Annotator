import {PolygonViewModel} from "../models/polygon-view-model";
import {Point} from "../models/point";
import {Size} from "../models/size";

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
    const xMax: number = position.x + size.width;
    const yMax: number = position.y + size.height;
    const croppedPolygons: PolygonViewModel[] = [];
    // Function to check if a point is within the crop rectangle
    const isWithinCropArea = (polygon: PolygonViewModel): boolean => {
      const points: number[][] = polygon.points;
      for (let point of points) {
        if ((point[0] >= position.x && point[0] <= xMax) && (point[1] >= position.y && point[1] <= yMax)) {
          return true;
        }
      }
      return false;
    };
    polygons.forEach((p: PolygonViewModel) => {
      if (!isWithinCropArea(p)) {
        return;
      }
      const croppedPoints = new Array<Array<number>>
      p.points.forEach((point: Array<number>): void => {
        let pointX: number = point[0];
        let pointY: number = point[1];
        if (pointX < position.x || pointX > xMax) {
          pointX = position.x;
        }
        if (pointY < position.y || pointY > position.y) {
          pointY = position.y;
        }
        croppedPoints.push([pointX, pointY]);
      });
      const newPolygonVm = new PolygonViewModel(p.id, croppedPoints, p.color);
      croppedPolygons.push(newPolygonVm);
    });
    return croppedPolygons;
  }

}

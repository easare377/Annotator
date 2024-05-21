import {PolygonViewModel} from "../models/polygon-view-model";

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

  static cropPolygons(polygons: PolygonViewModel[], x: number, y: number, width: number, height: number) {
    const croppedPolygons: PolygonViewModel[] = [];
    polygons.forEach((p:PolygonViewModel)=>{
      const croppedPoints = Array<Array<number>>
      p.points.forEach((point: Array<number>) => {
        let pointX:number = point[0];
        const pointY:number = point[1];
        if (pointX < x){
          pointX = x;
        }
      });
    });
  }

}

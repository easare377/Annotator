import { TestBed } from '@angular/core/testing';

import { PolygonCanvasRendererService } from './polygon-canvas-renderer.service';
import {PolygonViewModel} from '../models/polygon-view-model';
import {Point} from '../models/point';

describe('PolygonCanvasRendererService', () => {
  let service: PolygonCanvasRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonCanvasRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render larger polygons before smaller nested polygons', () => {
    const largePolygon = createSquare('large', 0, 0, 100);
    const smallPolygon = createSquare('small', 25, 25, 20);
    const mediumPolygon = createSquare('medium', 10, 10, 50);
    const polygons = [smallPolygon, largePolygon, mediumPolygon];

    const orderedPolygons = service.getRenderOrderedPolygons(polygons);

    expect(orderedPolygons).toEqual([largePolygon, mediumPolygon, smallPolygon]);
    expect(polygons).toEqual([smallPolygon, largePolygon, mediumPolygon]);
  });

  it('should hit-test smaller polygons before larger enclosing polygons', () => {
    const largePolygon = createSquare('large', 0, 0, 100);
    const smallPolygon = createSquare('small', 25, 25, 20);
    const mediumPolygon = createSquare('medium', 10, 10, 50);
    const polygons = [largePolygon, mediumPolygon, smallPolygon];

    const orderedPolygons = service.getHitTestOrderedPolygons(polygons);

    expect(orderedPolygons).toEqual([smallPolygon, mediumPolygon, largePolygon]);
    expect(polygons).toEqual([largePolygon, mediumPolygon, smallPolygon]);
  });

  function createSquare(id: string, x: number, y: number, size: number): PolygonViewModel {
    return new PolygonViewModel(id, [
      new Point(x, y),
      new Point(x + size, y),
      new Point(x + size, y + size),
      new Point(x, y + size)
    ]);
  }
});

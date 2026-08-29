import { TestBed } from '@angular/core/testing';

import { PolygonCanvasRendererService } from './polygon-canvas-renderer.service';
import {PolygonViewModel} from '../models/polygon-view-model';
import {Point} from '../models/point';
import {Size} from '../models/size';
import {AnnotationDisplayMode} from '../models/enum/annotation-display-mode';

describe('PolygonCanvasRendererService', () => {
  let service: PolygonCanvasRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonCanvasRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should contain a wide image without changing its aspect ratio', () => {
    const viewport = service.computeImageViewport(new Size(1000, 800), new Size(1600, 900));

    expect(viewport.scale).toBeCloseTo(0.625);
    expect(viewport.width).toBeCloseTo(1000);
    expect(viewport.height).toBeCloseTo(562.5);
    expect(viewport.offsetX).toBeCloseTo(0);
    expect(viewport.offsetY).toBeCloseTo(118.75);
  });

  it('should contain a tall image without changing its aspect ratio', () => {
    const viewport = service.computeImageViewport(new Size(1000, 800), new Size(600, 1200));

    expect(viewport.scale).toBeCloseTo(2 / 3);
    expect(viewport.width).toBeCloseTo(400);
    expect(viewport.height).toBeCloseTo(800);
    expect(viewport.offsetX).toBeCloseTo(300);
    expect(viewport.offsetY).toBeCloseTo(0);
  });

  it('should ignore pointer positions in the letterbox area', () => {
    const rect = {
      left: 0,
      top: 0,
      width: 1000,
      height: 800
    } as DOMRect;
    const letterboxEvent = {clientX: 500, clientY: 50} as MouseEvent;
    const imageEvent = {clientX: 500, clientY: 400} as MouseEvent;

    expect(service.computePointerImagePosition(letterboxEvent, new Size(1600, 900), rect)).toBeUndefined();
    expect(service.computePointerImagePosition(imageEvent, new Size(1600, 900), rect)).toEqual(new Point(800, 450));
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

  it('should hit-test the visible bounding box in bounding-box mode', () => {
    const triangle = new PolygonViewModel('triangle', [
      new Point(0, 0),
      new Point(100, 0),
      new Point(0, 100)
    ], '#3b82f6');
    const canvas = document.createElement('canvas');

    const result = service.findPolygonAtPoint(
      canvas,
      [triangle],
      new Point(80, 80),
      AnnotationDisplayMode.BOUNDING_BOXES
    );

    expect(result).toBe(triangle);
  });

  function createSquare(id: string, x: number, y: number, size: number): PolygonViewModel {
    return new PolygonViewModel(id, [
      new Point(x, y),
      new Point(x + size, y),
      new Point(x + size, y + size),
      new Point(x, y + size)
    ], '#3b82f6');
  }
});

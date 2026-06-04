import { TestBed } from '@angular/core/testing';

import { PolygonCanvasRendererService } from './polygon-canvas-renderer.service';

describe('PolygonCanvasRendererService', () => {
  let service: PolygonCanvasRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonCanvasRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

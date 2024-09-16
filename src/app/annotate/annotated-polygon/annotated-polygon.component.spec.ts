import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotatedPolygonComponent } from './annotated-polygon.component';

describe('AnnotatedPolygonComponent', () => {
  let component: AnnotatedPolygonComponent;
  let fixture: ComponentFixture<AnnotatedPolygonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotatedPolygonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotatedPolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiPolygonComponent } from './multi-polygon.component';

describe('MultiPolygonComponent', () => {
  let component: MultiPolygonComponent;
  let fixture: ComponentFixture<MultiPolygonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiPolygonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiPolygonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

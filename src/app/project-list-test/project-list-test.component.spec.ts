import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListTestComponent } from './project-list-test.component';

describe('ProjectListTestComponent', () => {
  let component: ProjectListTestComponent;
  let fixture: ComponentFixture<ProjectListTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectListTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectListTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

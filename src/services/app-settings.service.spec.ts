import {TestBed} from '@angular/core/testing';

import {AnnotationDisplayMode} from '../models/enum/annotation-display-mode';
import {ProjectImageSortBy} from '../models/enum/project-image-sort-by';
import {ProjectImageStatus} from '../models/enum/project-image-status';
import {ProjectImageViewMode} from '../models/enum/project-image-view-mode';
import {AppSettingsService} from './app-settings.service';

const SETTINGS_PREFIX = 'annotator:settings:';

describe('AppSettingsService', () => {
  let service: AppSettingsService;

  beforeEach(() => {
    removeAppSettings(localStorage);
    removeAppSettings(sessionStorage);
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppSettingsService);
  });

  afterEach(() => {
    removeAppSettings(localStorage);
    removeAppSettings(sessionStorage);
  });

  it('stores persistent Project Images preferences for the active user', () => {
    service.beginUserSession(7);
    service.storeProjectImagePreferences(
      ProjectImageSortBy.FILENAME,
      ProjectImageViewMode.TABLE,
      ProjectImageStatus.ANNOTATED
    );

    expect(service.getProjectImagePreferences()).toEqual({
      sortBy: ProjectImageSortBy.FILENAME,
      viewMode: ProjectImageViewMode.TABLE,
      statusFilter: ProjectImageStatus.ANNOTATED
    });

    service.endUserSession();
    service.beginUserSession(7);
    expect(service.getProjectImagePreferences().viewMode)
      .toBe(ProjectImageViewMode.TABLE);
  });

  it('clears annotation preferences when the user session ends', () => {
    sessionStorage.setItem('unrelated-setting', 'keep');
    service.beginUserSession(7);
    service.storeAnnotatePreferences('project-a', AnnotationDisplayMode.BOUNDING_BOXES);
    expect(service.getAnnotatePreferences('project-a').annotationDisplayMode)
      .toBe(AnnotationDisplayMode.BOUNDING_BOXES);

    service.endUserSession();
    service.beginUserSession(7);

    expect(service.getAnnotatePreferences('project-a').annotationDisplayMode)
      .toBe(AnnotationDisplayMode.POLYGONS);
    expect(sessionStorage.getItem('unrelated-setting')).toBe('keep');
    sessionStorage.removeItem('unrelated-setting');
  });

  it('isolates annotation preferences by project', () => {
    service.beginUserSession(7);
    service.storeAnnotatePreferences('project-a', AnnotationDisplayMode.BOUNDING_BOXES);

    expect(service.getAnnotatePreferences('project-b').annotationDisplayMode)
      .toBe(AnnotationDisplayMode.POLYGONS);

    service.storeAnnotatePreferences('project-b', AnnotationDisplayMode.POLYGONS);

    expect(service.getAnnotatePreferences('project-a').annotationDisplayMode)
      .toBe(AnnotationDisplayMode.BOUNDING_BOXES);
    expect(service.getAnnotatePreferences('project-b').annotationDisplayMode)
      .toBe(AnnotationDisplayMode.POLYGONS);
  });

  it('isolates persistent preferences by user', () => {
    service.beginUserSession(7);
    service.storeProjectImagePreferences(
      ProjectImageSortBy.PROGRESS,
      ProjectImageViewMode.TABLE,
      ProjectImageStatus.INCOMPLETE
    );

    service.beginUserSession(8);
    expect(service.getProjectImagePreferences()).toEqual({
      sortBy: ProjectImageSortBy.DATE_MODIFIED,
      viewMode: ProjectImageViewMode.GRID,
      statusFilter: ProjectImageStatus.ALL
    });
  });

  it('rejects invalid stored enum values and restores defaults', () => {
    service.beginUserSession(7);
    localStorage.setItem(
      `${SETTINGS_PREFIX}user:7:persistent:project-images`,
      JSON.stringify({
        version: 1,
        value: {sortBy: 'invalid', viewMode: 'table', statusFilter: 'all'}
      })
    );

    expect(service.getProjectImagePreferences()).toEqual({
      sortBy: ProjectImageSortBy.DATE_MODIFIED,
      viewMode: ProjectImageViewMode.GRID,
      statusFilter: ProjectImageStatus.ALL
    });
  });
});

function removeAppSettings(storage: Storage): void {
  for (let index = storage.length - 1; index >= 0; index--) {
    const key: string | null = storage.key(index);
    if (key?.startsWith(SETTINGS_PREFIX)) storage.removeItem(key);
  }
}

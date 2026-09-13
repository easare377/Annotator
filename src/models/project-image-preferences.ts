import {ProjectImageSortBy} from './enum/project-image-sort-by';
import {ProjectImageStatus} from './enum/project-image-status';
import {ProjectImageViewMode} from './enum/project-image-view-mode';

/** Persistent display preferences for the Project Images page. */
export interface ProjectImagePreferences {
  sortBy: ProjectImageSortBy;
  viewMode: ProjectImageViewMode;
  statusFilter: ProjectImageStatus;
}

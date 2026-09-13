import {AnnotationDisplayMode} from './enum/annotation-display-mode';

/** Session-scoped preferences used by one project's annotation workspace. */
export interface AnnotatePreferences {
  annotationDisplayMode: AnnotationDisplayMode;
}

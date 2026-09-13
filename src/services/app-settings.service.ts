import {Injectable} from '@angular/core';

import {AnnotatePreferences} from '../models/annotate-preferences';
import {AppSettingScope} from '../models/enum/app-setting-scope';
import {AnnotationDisplayMode} from '../models/enum/annotation-display-mode';
import {ProjectImageSortBy} from '../models/enum/project-image-sort-by';
import {ProjectImageStatus} from '../models/enum/project-image-status';
import {ProjectImageViewMode} from '../models/enum/project-image-view-mode';
import {ProjectImagePreferences} from '../models/project-image-preferences';

interface SettingDefinition<T extends object> {
  key: string;
  scope: AppSettingScope;
  version: number;
  defaults: T;
  isValid(value: unknown): value is T;
}

interface StoredSetting<T extends object> {
  version: number;
  value: T;
}

const SETTINGS_PREFIX = 'annotator:settings:';
const ACTIVE_USER_KEY = `${SETTINGS_PREFIX}active-user`;

const PROJECT_IMAGE_PREFERENCES: SettingDefinition<ProjectImagePreferences> = {
  key: 'project-images',
  scope: AppSettingScope.PERSISTENT,
  version: 1,
  defaults: {
    sortBy: ProjectImageSortBy.DATE_MODIFIED,
    viewMode: ProjectImageViewMode.GRID,
    statusFilter: ProjectImageStatus.ALL
  },
  isValid: isProjectImagePreferences
};

const ANNOTATE_PREFERENCES: SettingDefinition<AnnotatePreferences> = {
  key: 'annotate',
  scope: AppSettingScope.SESSION,
  version: 1,
  defaults: {
    annotationDisplayMode: AnnotationDisplayMode.POLYGONS
  },
  isValid: isAnnotatePreferences
};

@Injectable({providedIn: 'root'})
export class AppSettingsService {
  private activeUserPk: number | null = null;

  /** Select the user namespace used for subsequent settings operations. */
  beginUserSession(userPk: number): void {
    // Discard session settings when authentication changes to another user.
    try {
      if (sessionStorage.getItem(ACTIVE_USER_KEY) !== String(userPk)) {
        this.clearSessionSettings();
      }
      sessionStorage.setItem(ACTIVE_USER_KEY, String(userPk));
    } catch {
      // Settings remain available in memory through their component defaults.
    }
    this.activeUserPk = userPk;
  }

  /** Clear session-scoped settings when the authenticated session ends. */
  endUserSession(): void {
    this.clearSessionSettings();
    this.activeUserPk = null;
  }

  /** Return the current persistent project image preferences. */
  getProjectImagePreferences(): ProjectImagePreferences {
    return this.read(PROJECT_IMAGE_PREFERENCES);
  }

  /** Store the current persistent project image preferences. */
  storeProjectImagePreferences(
    sortBy: ProjectImageSortBy,
    viewMode: ProjectImageViewMode,
    statusFilter: ProjectImageStatus
  ): void {
    this.write(PROJECT_IMAGE_PREFERENCES, {sortBy, viewMode, statusFilter});
  }

  /** Return the current session-scoped annotate preferences for a project. */
  getAnnotatePreferences(projectId: string): AnnotatePreferences {
    return this.read(ANNOTATE_PREFERENCES, projectId);
  }

  /** Store the current session-scoped annotate preferences for a project. */
  storeAnnotatePreferences(
    projectId: string,
    annotationDisplayMode: AnnotationDisplayMode
  ): void {
    this.write(ANNOTATE_PREFERENCES, {annotationDisplayMode}, projectId);
  }

  private read<T extends object>(definition: SettingDefinition<T>, namespace?: string): T {
    if (this.activeUserPk === null) return {...definition.defaults};

    // Parse and validate browser data before exposing it to a component.
    try {
      const storage: Storage = this.getStorage(definition.scope);
      const key: string = this.getStorageKey(definition, namespace);
      const serialized: string | null = storage.getItem(key);
      if (!serialized) return {...definition.defaults};

      const storedSetting: unknown = JSON.parse(serialized);
      if (!this.isStoredSetting(storedSetting, definition)) {
        storage.removeItem(key);
        return {...definition.defaults};
      }
      return {...storedSetting.value};
    } catch {
      return {...definition.defaults};
    }
  }

  private write<T extends object>(
    definition: SettingDefinition<T>,
    value: T,
    namespace?: string
  ): void {
    if (this.activeUserPk === null || !definition.isValid(value)) return;

    // Store a versioned payload so future definitions can reject stale data.
    try {
      const storedSetting: StoredSetting<T> = {
        version: definition.version,
        value
      };
      this.getStorage(definition.scope).setItem(
        this.getStorageKey(definition, namespace),
        JSON.stringify(storedSetting)
      );
    } catch {
      // A blocked or full browser store should not interrupt the user workflow.
    }
  }

  private clearSessionSettings(): void {
    // Remove only Annotator-owned keys and preserve unrelated session data.
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index--) {
        const key: string | null = sessionStorage.key(index);
        if (key?.startsWith(SETTINGS_PREFIX)) sessionStorage.removeItem(key);
      }
    } catch {
      // There is no cleanup to perform when browser storage is unavailable.
    }
  }

  private getStorage(scope: AppSettingScope): Storage {
    return scope === AppSettingScope.PERSISTENT ? localStorage : sessionStorage;
  }

  private getStorageKey<T extends object>(
    definition: SettingDefinition<T>,
    namespace?: string
  ): string {
    const namespaceSuffix: string = namespace ? `:${namespace}` : '';
    return `${SETTINGS_PREFIX}user:${this.activeUserPk}:${definition.scope}:${definition.key}${namespaceSuffix}`;
  }

  private isStoredSetting<T extends object>(
    value: unknown,
    definition: SettingDefinition<T>
  ): value is StoredSetting<T> {
    if (!isRecord(value)) return false;
    return value['version'] === definition.version && definition.isValid(value['value']);
  }
}

/** Type guards for validating stored settings. */
function isProjectImagePreferences(value: unknown): value is ProjectImagePreferences {
  if (!isRecord(value)) return false;
  return isEnumValue(ProjectImageSortBy, value['sortBy'])
    && isEnumValue(ProjectImageViewMode, value['viewMode'])
    && isEnumValue(ProjectImageStatus, value['statusFilter']);
}

/** Type guard for validating annotate preferences. */
function isAnnotatePreferences(value: unknown): value is AnnotatePreferences {
  return isRecord(value)
    && isEnumValue(AnnotationDisplayMode, value['annotationDisplayMode']);
}

function isEnumValue(enumType: object, value: unknown): boolean {
  return Object.values(enumType).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpService} from "../../services/http.service";
import {ImageInfoRequestBody} from "../../models/imageInfo-request-body";
import { HttpResponse } from "@angular/common/http";
import {ImageInfoResponseBody} from "../../models/image-info-response-body";
import {ImageInfoViewModel} from "../../models/image-info-view-model";
import {Size} from "../../models/size";
import {AppManagerService} from "../../services/app-manager.service";
import {BaseComponent} from "../base-component";
import {NavigationService} from "../../services/navigation.service";
import {ProjectDataResponseBody} from "../../models/project-data-response-body";
import {ObjectClassResponseBody} from "../../models/object-class-response-body";
import {ImageUrls} from "../../models/image-urls";
import {ProjectInfoResponseBody} from "../../models/project-info-response-body";
import {ProjectImageSortBy} from "../../models/enum/project-image-sort-by";
import {ProjectImageStatus} from "../../models/enum/project-image-status";
import {ProjectImageViewMode} from "../../models/enum/project-image-view-mode";
import {AppSettingsService} from "../../services/app-settings.service";

@Component({
  selector: 'app-project-images',
  templateUrl: './project-images.component.html',
  styleUrls: ['./project-images.component.css']
})

export class ProjectImagesComponent extends BaseComponent implements OnInit {
  protected readonly ProjectImageSortBy = ProjectImageSortBy;
  protected readonly ProjectImageStatus = ProjectImageStatus;
  protected readonly ProjectImageViewMode = ProjectImageViewMode;
  projectId!: string;
  imageInfoVms: ImageInfoViewModel[] = new Array<ImageInfoViewModel>;
  objectClasses: ObjectClassResponseBody[] = []
  projectInfo: ProjectInfoResponseBody | undefined;
  selectedImage: ImageInfoViewModel | undefined;
  selectedImageIds: Set<string> = new Set<string>();
  searchTerm: string = '';
  statusFilter: ProjectImageStatus = ProjectImageStatus.ALL;
  sortBy: ProjectImageSortBy = ProjectImageSortBy.DATE_MODIFIED;
  viewMode: ProjectImageViewMode = ProjectImageViewMode.GRID;
  isLoadingProjectData: boolean = false;
  hasLoadError: boolean = false;

  constructor(private httpService: HttpService, private route: ActivatedRoute,
              private appManagerService: AppManagerService, private navService: NavigationService,
              private appSettings: AppSettingsService) {
    super();
  }

  ngOnInit(): void {
    // Restore the user's local browser preferences before loading project data.
    const preferences = this.appSettings.getProjectImagePreferences();
    this.sortBy = preferences.sortBy;
    this.viewMode = preferences.viewMode;
    this.statusFilter = preferences.statusFilter;

    this.route.queryParams.subscribe(async params => {
      this.projectId = params['pid'];
      if (!this.projectId) {
        await this.navService.gotoProjectPageAsync();
      } else {
        await this.getProjectDataAsync(this.projectId);
      }
    });
    // this.projectId = this.appManagerService.getData('projectId');
    //   if (this.projectId)
    //     this.getProjectDataAsync(this.projectId).then();
  }

  async getProjectDataAsync(projectId: string): Promise<void> {
    this.isLoadingProjectData = true;
    this.hasLoadError = false;
    try {
      const resp: HttpResponse<ProjectDataResponseBody> =
        await this.httpService.getProjectDataAsync(new ImageInfoRequestBody(projectId))
      // console.log(resp);
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          this.projectInfo = resp.body.projectInfo;
          this.objectClasses = resp.body.projectSetup.objectClasses;
          this.imageInfoVms = [];
          this.selectedImageIds = new Set<string>();
          const imageInfosRespBody: Array<ImageInfoResponseBody> = resp.body.imageInfos;
          imageInfosRespBody.forEach(imageInfoRespBody => {
            this.createImageInfo(imageInfoRespBody);
          });
          this.ensureVisibleSelection();
          break;
        default:
          this.hasLoadError = true;
          break;
      }
    } catch (e) {
      console.log(e);
      this.hasLoadError = true;
    } finally {
      this.isLoadingProjectData = false;
    }
  }

  async refreshProjectDataAsync(): Promise<void> {
    if (!this.projectId) return;
    await this.getProjectDataAsync(this.projectId);
  }

  createImageInfo(projectRespBody: ImageInfoResponseBody): void {
    const imageId: string = projectRespBody.imageId;
    const imageUrls: ImageUrls = projectRespBody.imageUrls;
    const originalFilename: string = projectRespBody.originalFileName
    const imageSize: Size = projectRespBody.imageSize;
    const dateAdded: Date = projectRespBody.dateAdded;
    const dateModified: Date = projectRespBody.dateModified;
    const imageInfoVm =
      new ImageInfoViewModel(imageId, imageUrls, imageSize, originalFilename, dateAdded, dateModified);
    this.imageInfoVms.push(imageInfoVm);
  }

  get filteredImages(): ImageInfoViewModel[] {
    const term: string = this.searchTerm.trim().toLowerCase();
    return this.imageInfoVms
      .filter(imageInfo => {
        const matchesSearch: boolean = !term || imageInfo.originalFileName.toLowerCase().includes(term);
        const matchesStatus: boolean = this.statusFilter === ProjectImageStatus.ALL
          || this.getImageStatus(imageInfo) === this.statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => this.compareImages(a, b));
  }

  get totalImages(): number {
    return this.imageInfoVms.length;
  }

  get detectedImages(): number {
    return this.imageInfoVms.filter(imageInfo => imageInfo.polygonVms !== undefined).length;
  }

  get annotatedImages(): number {
    return this.imageInfoVms
      .filter(imageInfo => this.getImageStatus(imageInfo) === ProjectImageStatus.ANNOTATED).length;
  }

  get incompleteImages(): number {
    return this.imageInfoVms
      .filter(imageInfo => this.getImageStatus(imageInfo) === ProjectImageStatus.INCOMPLETE).length;
  }

  get selectedCount(): number {
    return this.selectedImageIds.size;
  }

  get allVisibleSelected(): boolean {
    return this.filteredImages.length > 0 && this.filteredImages.every(imageInfo => this.selectedImageIds.has(imageInfo.imageId));
  }

  get someVisibleSelected(): boolean {
    return !this.allVisibleSelected && this.filteredImages.some(imageInfo => this.selectedImageIds.has(imageInfo.imageId));
  }

  get selectedImageDimensions(): string {
    const imageSize: Size | undefined = this.selectedImage?.imageSize;
    if (!imageSize) return '-';
    return `${imageSize.width} x ${imageSize.height}`;
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    this.ensureVisibleSelection();
  }

  setStatusFilter(value: ProjectImageStatus): void {
    this.statusFilter = value;
    this.storePreferences();
    this.ensureVisibleSelection();
  }

  setSortBy(value: ProjectImageSortBy): void {
    this.sortBy = value;
    this.storePreferences();
  }

  setViewMode(value: ProjectImageViewMode): void {
    this.viewMode = value;
    this.storePreferences();
  }

  selectImage(imageInfo: ImageInfoViewModel): void {
    this.selectedImage = imageInfo;
  }

  openAnnotate(imageInfo: ImageInfoViewModel): void {
    this.appManagerService.addData('projectId', this.projectId);
    this.navService.gotoAnnotateImagesAsync(this.projectId, imageInfo.imageId).then();
  }

  goToProjects(): void {
    this.navService.gotoProjectPageAsync().then();
  }

  annotateSelected(): void {
    if (this.selectedImageIds.size !== 1) return;
    const selectedId: string | undefined = Array.from(this.selectedImageIds)[0];
    const imageInfo: ImageInfoViewModel | undefined = this.imageInfoVms.find(image => image.imageId === selectedId);
    if (imageInfo) {
      this.openAnnotate(imageInfo);
    }
  }

  toggleImageSelection(imageInfo: ImageInfoViewModel, selected: boolean): void {
    const nextSelection: Set<string> = new Set<string>(this.selectedImageIds);
    selected ? nextSelection.add(imageInfo.imageId) : nextSelection.delete(imageInfo.imageId);
    this.selectedImageIds = nextSelection;
  }

  toggleAllVisibleImages(selected: boolean): void {
    const nextSelection: Set<string> = new Set<string>(this.selectedImageIds);
    this.filteredImages.forEach(imageInfo => {
      selected ? nextSelection.add(imageInfo.imageId) : nextSelection.delete(imageInfo.imageId);
    });
    this.selectedImageIds = nextSelection;
  }

  clearSelection(): void {
    this.selectedImageIds = new Set<string>();
  }

  isSelected(imageInfo: ImageInfoViewModel): boolean {
    return this.selectedImageIds.has(imageInfo.imageId);
  }

  isSelectedImage(imageInfo: ImageInfoViewModel): boolean {
    return this.selectedImage?.imageId === imageInfo.imageId;
  }

  getImageStatus(imageInfo: ImageInfoViewModel): ProjectImageStatus {
    if (!imageInfo.polygonVms) return ProjectImageStatus.NOT_DETECTED;
    const polygonCount: number = imageInfo.polygonVms.length;
    const annotatedCount: number = imageInfo.annotatedPolygonVms.length;
    if (polygonCount > 0 && annotatedCount >= polygonCount) return ProjectImageStatus.ANNOTATED;
    if (annotatedCount > 0) return ProjectImageStatus.INCOMPLETE;
    return ProjectImageStatus.DETECTED;
  }

  getImageStatusLabel(imageInfo: ImageInfoViewModel): string {
    switch (this.getImageStatus(imageInfo)) {
      case ProjectImageStatus.ANNOTATED:
        return 'Annotated';
      case ProjectImageStatus.INCOMPLETE:
        return 'In progress';
      case ProjectImageStatus.DETECTED:
        return 'Ready';
      default:
        return 'Not detected';
    }
  }

  getPolygonCountText(imageInfo: ImageInfoViewModel): string {
    return imageInfo.polygonVms ? imageInfo.polygonVms.length.toString() : '-';
  }

  getAnnotationProgress(imageInfo: ImageInfoViewModel): number {
    if (!imageInfo.polygonVms || imageInfo.polygonVms.length === 0) return 0;
    return Math.min(100, Math.round((imageInfo.annotatedPolygonVms.length / imageInfo.polygonVms.length) * 100));
  }

  private ensureVisibleSelection(): void {
    const visibleImages: ImageInfoViewModel[] = this.filteredImages;
    if (this.selectedImage && visibleImages.some(imageInfo => imageInfo.imageId === this.selectedImage?.imageId)) return;
    this.selectedImage = visibleImages[0] ?? this.imageInfoVms[0];
  }

  private storePreferences(): void {
    this.appSettings.storeProjectImagePreferences(
      this.sortBy,
      this.viewMode,
      this.statusFilter
    );
  }

  private compareImages(a: ImageInfoViewModel, b: ImageInfoViewModel): number {
    switch (this.sortBy) {
      case ProjectImageSortBy.DATE_ADDED:
        return this.getTimeValue(b.dateAdded) - this.getTimeValue(a.dateAdded);
      case ProjectImageSortBy.FILENAME:
        return a.originalFileName.localeCompare(b.originalFileName);
      case ProjectImageSortBy.PROGRESS:
        return this.getAnnotationProgress(b) - this.getAnnotationProgress(a);
      default:
        return this.getTimeValue(b.dateModified) - this.getTimeValue(a.dateModified);
    }
  }

  private getTimeValue(value: Date): number {
    return new Date(value).getTime();
  }

}

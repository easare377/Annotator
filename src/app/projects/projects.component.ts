import {Component, OnInit} from '@angular/core';
import {ProjectViewModel} from "../../models/project-view-model";
import {ProjectInfoResponseBody} from "../../models/project-info-response-body";
import {RequestBody} from "../../models/request-body";
import {HttpService} from "../../services/http.service";
import {NavigationService} from "../../services/navigation.service";
import {AppManagerService} from "../../services/app-manager.service";
import { HttpResponse } from "@angular/common/http";


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: ProjectViewModel[] = [];
  isLoadingProjects = false;
  loadProjectsError: string | undefined;

  constructor(private httpService: HttpService, public navService: NavigationService, public appManagerService: AppManagerService) {
  }

  ngOnInit(): void {
    // Initialize with one project
    // this.projects.push({
    //   name: 'New Project #1',
    //   createdAt: new Date('2024-05-25T11:25:00'),
    //   stats: {total: 1, success: 0, error: 0, warning: 0},
    //   initials: 'GK'
    // });
    this.loadProjectsAsync().then();
  }

  async loadProjectsAsync(): Promise<void> {
    this.isLoadingProjects = true;
    this.loadProjectsError = undefined;
    try {
      const resp: HttpResponse<Array<ProjectInfoResponseBody>> = await this.httpService.getProjectsAsync(new RequestBody())
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          this.displayProjects(resp.body);
          break;
        default:
          this.loadProjectsError = 'Unable to load projects.';
      }
    } catch (e) {
      console.log(e);
      this.loadProjectsError = 'Unable to load projects.';
    } finally {
      this.isLoadingProjects = false;
    }
  }

  displayProjects(projectsRespBody: ProjectInfoResponseBody[]): void {
    this.projects.splice(0);
    projectsRespBody.forEach(projectRespBody => {
      this.displayProject(projectRespBody);
    })
  }

  displayProject(projectRespBody: ProjectInfoResponseBody): void {
    const projectId: string = projectRespBody.projectId;
    const projectName: string = projectRespBody.name;
    const projectDesc: string | null = projectRespBody.description;
    const dateCreated: Date = projectRespBody.dateCreated;
    const projectVm = new ProjectViewModel(projectId, projectName, dateCreated, projectDesc);
    this.projects.push(projectVm);
  }

  openProject(project: ProjectViewModel): void {
    this.appManagerService.addData('projectId', project.projectId);
    this.navService.gotoProjectImagesPageAsync(project.projectId).then();
  }

  getProjectInitials(project: ProjectViewModel): string {
    return project.name
      .split(' ')
      .filter((part: string) => part.length > 0)
      .slice(0, 2)
      .map((part: string) => part[0].toUpperCase())
      .join('') || 'P';
  }

  // Use step approach.
  createProject(): void {
    const projectCount = this.projects.length + 1;
    // this.projects.push({
    //   name: `New Project #${projectCount}`,
    //   createdAt: new Date(),
    //   stats: {total: 1, success: 0, error: 0, warning: 0},
    //   initials: 'GK'
    // });
  }
}

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

  constructor(private httpService: HttpService, public navService: NavigationService, public appManagerService: AppManagerService) {
  }
  imageUrl:string='../assets/images/DJI_0183_AS_0320_03.JPG';

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
    try {
      const resp: HttpResponse<Array<ProjectInfoResponseBody>> = await this.httpService.getProjectsAsync(new RequestBody())
      switch (resp.status) {
        case 200:
          if (!resp.body) {
            throw new Error();
          }
          const projectsRespBody: Array<ProjectInfoResponseBody> = resp.body;
          projectsRespBody.forEach(projectRespBody => {
            this.displayProject(projectRespBody);
          })
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }

  displayProjects(projectsRespBody: ProjectInfoResponseBody[]): void {
    this.projects.splice(0, this.projects.length - 1);
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


import {Component, OnInit} from '@angular/core';
import {ProjectViewModel} from "../../models/project-view-model";
import {ProjectInfoResponseBody} from "../../models/project-info-response-body";
import {RequestBody} from "../../models/request-body";
import {HttpService} from "../../services/http.service";
import {NavigationService} from "../../services/navigation.service";
import {AppManagerService} from "../../services/app-manager.service";
import { HttpResponse } from "@angular/common/http";
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../temporal.css']
})
export class ProjectsComponent implements OnInit {
  projects: ProjectViewModel[] = [];

  constructor(private httpService: HttpService, public navService: NavigationService, public appManagerService: AppManagerService,private dialog: MatDialog) {
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
  openDeleteDialog(projectId: string) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
      data: { item: 'this project' } // Updated to delete project, not image
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProject(projectId); // Call the method to delete the project
      }
    });
  }
  async deleteProject(projectId: string) {
    try {
      // Call the actual delete API for the project (assuming it's a project, not an image)
      // const response = await this.httpService.deleteProjectAsync(projectId); 
      console.log('Project deleted successfully');
      
      // Optionally, update the list or refresh the UI after the project is deleted
      this.projects = this.projects.filter(project => project.projectId !== projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
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


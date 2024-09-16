import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectImagesComponent} from "./project-images/project-images.component";
import {AnnotateComponent} from "./annotate/annotate.component";
import { ProjectListTestComponent } from './project-list-test/project-list-test.component';
import { CreateProjectComponent } from './create-project/create-project.component';


const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent,
  },
  {
    path: 'projects/data',
    component: ProjectImagesComponent,
  },
  {
    path: 'projects/data/annotate',
    component: AnnotateComponent
  },
  {
    path:'test',
    component:ProjectListTestComponent
  },
  {
    path:'createproject',
    component:CreateProjectComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

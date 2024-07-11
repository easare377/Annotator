import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectImagesComponent} from "./project-images/project-images.component";
import {AnnotateComponent} from "./annotate/annotate.component";


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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

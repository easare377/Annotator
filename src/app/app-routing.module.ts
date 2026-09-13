import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProjectsComponent} from "./projects/projects.component";
import {ProjectImagesComponent} from "./project-images/project-images.component";
import {AnnotateComponent} from "./annotate/annotate.component";


import { SignUpComponent } from './sign-up/sign-up.component';
import { authGuard } from '../services/auth.guard';

const routes: Routes = [
  { path: 'login', title: 'Log in | Annotator', component: SignUpComponent, data: { mode: 'login' } },
  { path: 'signup', title: 'Create account | Annotator', component: SignUpComponent, data: { mode: 'signup' } },
  {
    path: '',
    component: ProjectsComponent, canActivate: [authGuard],
  },
  {
    path: 'projects/data',
    component: ProjectImagesComponent, canActivate: [authGuard],
  },
  {
    path: 'projects/data/annotate',
    component: AnnotateComponent, canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProjectComponent } from '../app/create-project/create-project.component';
import { ProjectsComponent } from '../app/projects/projects.component'; // Import your target component

const routes: Routes = [
  { path: 'create-project', component: CreateProjectComponent },
  { path: 'projects', component: ProjectsComponent }, // Define route for the target component
  { path: '', redirectTo: '/create-project', pathMatch: 'full' },
  // Add other routes as necessary
];

// const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

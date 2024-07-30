import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TrailComponent } from './trail/trail.component';
import { CanvasAreaDrawComponent } from './canvas-area-draw/canvas-area-draw.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MultiPolygonComponent } from './annotate/multi-polygon/multi-polygon.component';
import {NgOptimizedImage} from "@angular/common";
import { HttpClientModule } from '@angular/common/http';
import { AssignClassDialogComponent } from './dialogs/assign-class-dialog/assign-class-dialog.component';
import { AnnotateComponent } from './annotate/annotate.component';
import {ClickOutsideDirective} from "./click-outside.directive";
import { CustomScrollDirective } from './custom-scroll.directive';
import { CreateProjectDialogComponent } from './dialogs/create-project-dialog/create-project-dialog.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import {AnnotatedPolygonComponent} from "./annotate/annotated-polygon/annotated-polygon.component";
import {ObjectClassComponent} from "./object-class/object-class.component";
import {ImageNavigationComponent} from "./image-navigation/image-navigation.component";
import {LabelingSetupComponent} from "./dialogs/create-project-dialog/labeling-setup/labeling-setup.component";
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { ViewProjectComponent } from './view-project/view-project.component';
import {ProjectsComponent} from "./projects/projects.component";
import { ProjectImagesComponent } from './project-images/project-images.component';
import { ImageDataTableComponent } from './project-images/image-data-table/image-data-table.component';
import { CreateProjectSetupComponent } from './dialogs/create-project-dialog/create-project-setup/create-project-setup.component';
import { UploadImagesSetupComponent } from './dialogs/create-project-dialog/upload-images-setup/upload-images-setup.component';
import { AddedObjectClassComponent } from './dialogs/create-project-dialog/labeling-setup/added-object-class/added-object-class.component';
import { ImportDataDialogComponent } from './dialogs/import-data-dialog/import-data-dialog.component';
import { FileUploadComponent } from './dialogs/import-data-dialog/file-upload/file-upload.component';
import { GeneratePolygonDialogComponent } from './dialogs/generate-polygon-dialog/generate-polygon-dialog.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TrailComponent,
    CanvasAreaDrawComponent,
    SidenavComponent,
    MultiPolygonComponent,
    AssignClassDialogComponent,
    AnnotateComponent,
    CustomScrollDirective,
    CreateProjectDialogComponent,
    SignUpComponent,
    AnnotatedPolygonComponent,
    ObjectClassComponent,
    ImageNavigationComponent,
    LabelingSetupComponent,
    ToggleButtonComponent,
    ViewProjectComponent,
    ProjectsComponent,
    ProjectImagesComponent,
    ImageDataTableComponent,
    CreateProjectSetupComponent,
    UploadImagesSetupComponent,
    AddedObjectClassComponent,
    ImportDataDialogComponent,
    FileUploadComponent,
    GeneratePolygonDialogComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgOptimizedImage,
        HttpClientModule,
        ClickOutsideDirective,
        ReactiveFormsModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

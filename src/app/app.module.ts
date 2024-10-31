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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import {SubmitReviewSetupComponent} from './dialogs/create-project-dialog/submit-review-setup/submit-review-setup.component'
import { AddedObjectClassComponent } from './dialogs/create-project-dialog/labeling-setup/added-object-class/added-object-class.component';
import { ImportDataDialogComponent } from './dialogs/import-data-dialog/import-data-dialog.component';
import { FileUploadComponent } from './dialogs/import-data-dialog/file-upload/file-upload.component';
import { GeneratePolygonDialogComponent } from './dialogs/generate-polygon-dialog/generate-polygon-dialog.component';
import { ExportDataProgressDialogComponent } from './dialogs/export-data-progress-dialog/export-data-progress-dialog.component';
import { BoundingBoxComponent } from './annotate/bounding-box/bounding-box.component';
import { ProjectListTestComponent } from './project-list-test/project-list-test.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatStepperModule } from '@angular/material/stepper';

import { MatButtonModule } from '@angular/material/button'; 


import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // If you're using input fields






@NgModule({ declarations: [
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
        ExportDataProgressDialogComponent,
        BoundingBoxComponent,
        ProjectListTestComponent,
        CreateProjectComponent,
        SubmitReviewSetupComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgOptimizedImage,
        ClickOutsideDirective,
        MatStepperModule,
        MatButtonModule,
        MatInputModule ,
        MatFormFieldModule ,
        MatSelectModule ,
        ReactiveFormsModule], providers: [provideHttpClient(withInterceptorsFromDi()), provideAnimationsAsync()] })
export class AppModule { }

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
import { MultiPolygonComponent } from './multi-polygon/multi-polygon.component';
import {NgOptimizedImage} from "@angular/common";
import { HttpClientModule } from '@angular/common/http';
import { AssignClassDialogComponent } from './dialogs/assign-class-dialog/assign-class-dialog.component';
import { AnnotateComponent } from './annotate/annotate.component';
import {ClickOutsideDirective} from "./click-outside.directive";
import { CustomScrollDirective } from './custom-scroll.directive';
import { CreateProjectComponent } from './create-project/create-project.component';
import { SignUpComponent } from './sign-up/sign-up.component';



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
    CreateProjectComponent,
    SignUpComponent,

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

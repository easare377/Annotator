import { Injectable } from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router) {

  }

  async gotoProjectImagesPageAsync(): Promise<void> {
    //await this.router.navigate(['projects/data', projectId])
    await this.router.navigateByUrl('projects/data')
  }

  async gotoAnnotateImagesAsync(): Promise<void> {
    // await this.router.navigate(['projects/data/annotate', imageId])
    await this.router.navigateByUrl('projects/data/annotate')
  }
}

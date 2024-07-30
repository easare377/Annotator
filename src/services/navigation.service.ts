import {Injectable} from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {


  constructor(private router: Router) {

  }

  async gotoProjectPageAsync(): Promise<any> {
    await this.router.navigateByUrl('')
  }

  async gotoProjectImagesPageAsync(projectId: string): Promise<void> {
    //await this.router.navigate(['projects/data', projectId])
    await this.router.navigate(['projects/data'], {queryParams: {pid: projectId}})
  }

  async gotoAnnotateImagesAsync(projectId: string, imageId: string): Promise<void> {
    // await this.router.navigate(['projects/data/annotate', imageId])
    await this.router.navigate(['projects/data/annotate'], {queryParams: {pid: projectId, imid: imageId}})
  }
}

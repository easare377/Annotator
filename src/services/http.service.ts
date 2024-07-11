import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, firstValueFrom} from 'rxjs';
import {ProjectInfoRequestBody} from "../models/project-info-request-body";
import {Uris} from "../models/uris";
import {RequestBody} from "../models/request-body";
import {ProjectInfoResponseBody} from "../models/project-info-response-body";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {ImageInfoBase} from "../models/image-info-base";
import {ImageInfoResponseBody} from "../models/image-info-response-body";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly dataUrl = 'assets/data/DJI_0183_AS_0320_03.json';  // Path to the JSON file
  constructor(private http: HttpClient) {

  }

  private getRequestHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  // Method to fetch data
  async getJsonDataAsync(dataUrl: string): Promise<Promise<Array<Array<Array<number>>>>> {
    // return await this.http.get<Array<Array<number>>>(this.dataUrl);
    try {
      return await firstValueFrom(this.http.get<Array<Array<Array<number>>>>(dataUrl));
    } catch (error) {
      console.error('Error fetching JSON data:', error);
      return [];
    }
  }

  async getProjects(requestBody: RequestBody | null): Promise<HttpResponse<Array<ProjectInfoResponseBody>>> {
    return new Promise<HttpResponse<Array<ProjectInfoResponseBody>>>((resolve, reject) => {
      this.http.post<Array<ProjectInfoResponseBody>>(Uris.projectsUrl, requestBody,
        {observe: 'response', headers: this.getRequestHeaders()}).subscribe({
        next: response => {
          resolve(response);
        },
        error: error => {
          reject(error);
        }
      });

    });
  }

  async getImageInfosAsync(requestBody: RequestBody): Promise<HttpResponse<Array<ImageInfoResponseBody>>> {
    return new Promise<HttpResponse<Array<ImageInfoResponseBody>>>((resolve, reject) => {
      this.http.post<Array<ImageInfoResponseBody>>(Uris.projectDataUrl, requestBody,
        {observe: 'response', headers: this.getRequestHeaders()}).subscribe({
        next: response => {
          resolve(response);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }

  async createProjectAsync(projectInfo: ProjectInfoRequestBody): Promise<HttpResponse<Array<ProjectInfoResponseBody>>> {
    return new Promise<HttpResponse<Array<ProjectInfoResponseBody>>>((resolve, reject) => {
      this.http.post<Array<ProjectInfoResponseBody>>(Uris.createProjectUrl, projectInfo,
        {observe: 'response', headers: this.getRequestHeaders()}).subscribe({
        next: response => {
          resolve(response);
        },
        error: error => {
          reject(error);
        }
      });
    });
  }

}

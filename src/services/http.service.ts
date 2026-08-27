import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ProjectInfoRequestBody} from "../models/project-info-request-body";
import {Uris} from "../models/uris";
import {RequestBody} from "../models/request-body";
import {ProjectInfoResponseBody} from "../models/project-info-response-body";
import {PolygonInfoRequestBody} from "../models/polygon-info-request-body";
import {PolygonInfoResponseBody} from "../models/polygon-info-response-body";
import {ProjectDataResponseBody} from "../models/project-data-response-body";
import { ClearEmptyPolygonsRequestBody } from '../models/clear-empty-polygons-request-body';

export interface ImageUploadDetails {
  fileName: string;
  width: number;
  height: number;
}

export interface ImageUploadLink {
  imageId: string;
  storageKey: string;
  uploadUrl: string;
  method: string;
}

export interface GeneratedImageUpload {
  imageId: string;
  uploadLink: ImageUploadLink;
}

export interface GenerateImageUploadLinksResponse {
  uploads: GeneratedImageUpload[];
}

export interface OriginalImageUploadResponse {
  imageId: string;
  storageKey: string;
  bytesUploaded: number;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  //private readonly dataUrl = 'assets/data/DJI_0183_AS_0320_03.json';  // Path to the JSON file
  constructor(private http: HttpClient) {

  }

  private getRequestHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  // Method to fetch data
  // async getJsonDataAsync(dataUrl: string): Promise<Promise<Array<Array<Array<number>>>>> {
  //   // return await this.http.get<Array<Array<number>>>(this.dataUrl);
  //   try {
  //     return await firstValueFrom(this.http.get<Array<Array<Array<number>>>>(dataUrl));
  //   } catch (error) {
  //     console.error('Error fetching JSON data:', error);
  //     return [];
  //   }
  // }

  async getProjectsAsync(requestBody: RequestBody | null): Promise<HttpResponse<Array<ProjectInfoResponseBody>>> {
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

  async getProjectDataAsync(requestBody: RequestBody): Promise<HttpResponse<ProjectDataResponseBody>> {
    return new Promise<HttpResponse<ProjectDataResponseBody>>((resolve, reject) => {
      this.http.post<ProjectDataResponseBody>(Uris.projectDataUrl, requestBody,
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

  async createProjectAsync(projectInfo: ProjectInfoRequestBody): Promise<HttpResponse<ProjectInfoResponseBody>> {
    return new Promise<HttpResponse<ProjectInfoResponseBody>>((resolve, reject) => {
      this.http.post<ProjectInfoResponseBody>(Uris.createProjectUrl, projectInfo,
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

  async generateUploadImageLinksAsync(
    projectId: string,
    imageDetails: ImageUploadDetails[]
  ): Promise<HttpResponse<GenerateImageUploadLinksResponse>> {
    const requestBody = {
      projectId,
      images: imageDetails.map((details: ImageUploadDetails) => ({
        imageDetails: details
      }))
    };

    return new Promise<HttpResponse<GenerateImageUploadLinksResponse>>((resolve, reject) => {
      this.http.post<GenerateImageUploadLinksResponse>(
        `${Uris.baseUrl}/api/projects/data/generate-upload-image-link`,
        requestBody,
        {observe: 'response', headers: this.getRequestHeaders()}
      ).subscribe({
        next: response => resolve(response),
        error: error => reject(error)
      });
    });
  }

  async uploadImageAsync(
    uploadLink: ImageUploadLink,
    image: File,
    onProgress?: (progress: number) => void
  ): Promise<HttpResponse<OriginalImageUploadResponse>> {
    const method: string = uploadLink.method.toUpperCase();
    let requestBody: FormData | File = image;
    if (method === 'POST') {
      const formData: FormData = new FormData();
      formData.append('image', image, image.name);
      requestBody = formData;
    }

    const request = new HttpRequest<FormData | File>(
      method,
      uploadLink.uploadUrl,
      requestBody,
      {reportProgress: true}
    );

    return new Promise<HttpResponse<OriginalImageUploadResponse>>((resolve, reject) => {
      this.http.request<OriginalImageUploadResponse>(request).subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            onProgress?.((event.loaded / event.total) * 100);
          }
          if (event.type === HttpEventType.Response) {
            resolve(event);
          }
        },
        error: error => reject(error)
      });
    });
  }

  async completeImageUploadAsync(imageId: string): Promise<HttpResponse<string>> {
    return new Promise<HttpResponse<string>>((resolve, reject) => {
      this.http.post<string>(
        `${Uris.baseUrl}/api/projects/data/complete-image-upload`,
        {imageId},
        {observe: 'response', headers: this.getRequestHeaders()}
      ).subscribe({
        next: response => resolve(response),
        error: error => reject(error)
      });
    });
  }

  async getImagePolygonsAsync(polygonInfo: PolygonInfoRequestBody): Promise<HttpResponse<PolygonInfoResponseBody[]>> {
    return new Promise<HttpResponse<PolygonInfoResponseBody[]>>((resolve, reject) => {
      this.http.post<PolygonInfoResponseBody[]>(Uris.imagePolygonsUrl, polygonInfo,
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

  async generateImagePolygonsAsync(polygonInfo: PolygonInfoRequestBody): Promise<HttpResponse<PolygonInfoResponseBody[]>> {
    return new Promise<HttpResponse<PolygonInfoResponseBody[]>>((resolve, reject) => {
      this.http.post<PolygonInfoResponseBody[]>(Uris.generatePolygonsUrl, polygonInfo,
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

  async savePolygonObjectClassesAsync(objectClassInfo: RequestBody): Promise<HttpResponse<string>>{
    return new Promise<HttpResponse<string>>((resolve, reject) => {
      this.http.post<string>(Uris.annotateImageUrl, objectClassInfo,
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

  async exportProjectMaskAsync(exportProjectInfo: RequestBody): Promise<HttpResponse<string>>{
    return new Promise<HttpResponse<string>>((resolve, reject) => {
      this.http.post<string>(Uris.exportProjectUrl, exportProjectInfo,
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

  async exportProjectAsJsonAsync(exportProjectInfo: RequestBody): Promise<HttpResponse<string>>{
    return new Promise<HttpResponse<string>>((resolve, reject) => {
      this.http.post<string>(Uris.exportProjectAsJsonUrl, exportProjectInfo,
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


  async exportProjectAsVocAsync(exportProjectInfo: RequestBody): Promise<HttpResponse<string>>{
    return new Promise<HttpResponse<string>>((resolve, reject) => {
      this.http.post<string>(Uris.exportProjectAsVocUrl, exportProjectInfo,
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

  async clearEmptyPolygonsAsync(requestBody: ClearEmptyPolygonsRequestBody): Promise<HttpResponse<PolygonInfoResponseBody[]>>{
    return new Promise<HttpResponse<PolygonInfoResponseBody[]>>((resolve, reject) => {
      this.http.post<PolygonInfoResponseBody[]>(Uris.clearEmptyPolygonsUrl, requestBody,
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





  // uploadImage(image: File): Observable<{ progress: number, response?: any }> {
  //   const formData: FormData = new FormData();
  //   formData.append('image', image, image.name);
  //
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'multipart/form-data'
  //   });
  //
  //   const req = new HttpRequest('POST', Uris.uploadImageUrl, formData, {
  //     headers: headers,
  //     reportProgress: true,
  //     observe: 'events'
  //   });
  //
  //   return this.http.request(req).pipe(map(event => {
  //     switch (event.type) {
  //       case HttpEventType.UploadProgress:
  //         const progress = Math.round(100 * event.loaded / event.total);
  //         return { progress: progress };
  //
  //       case HttpEventType.Response:
  //         return { progress: 100, response: event.body };
  //
  //       default:
  //         return { progress: 0 };
  //     }
  //   }));
  // }

}

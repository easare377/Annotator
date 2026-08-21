import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IImageUploadHandler } from '../models/interfaces/i-image-upload-handler';
import { ImageInfoResponseBody } from '../models/image-info-response-body';
import { RequestBody } from '../models/request-body';
import { Uris } from '../models/uris';

/** Uploads images through the Django API. */
@Injectable({
  providedIn: 'root',
})
export class DjangoImageUploadHandler
  implements IImageUploadHandler<RequestBody, HttpResponse<ImageInfoResponseBody[]>> {
  constructor(private readonly http: HttpClient) {}

  uploadAsync(
    project: RequestBody,
    image: File,
    onProgress?: (progress: number) => void,
  ): Promise<HttpResponse<ImageInfoResponseBody[]>> {
    const formData = new FormData();
    formData.append('image', image, image.name);
    formData.append('imageDetails', JSON.stringify(project));

    const request = new HttpRequest<FormData>('POST', Uris.uploadImageUrl, formData, {
      reportProgress: true,
    });

    return new Promise((resolve, reject) => {
      this.http.request<ImageInfoResponseBody[]>(request).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            onProgress?.((event.loaded / event.total) * 100);
          }

          if (event.type === HttpEventType.Response) {
            resolve(event);
          }
        },
        error: reject,
      });
    });
  }
}

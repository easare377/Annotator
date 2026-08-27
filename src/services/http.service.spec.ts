import { HttpEventType } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  GeneratedImageUpload,
  HttpService,
  ImageUploadLink
} from './http.service';
import { Uris } from '../models/uris';

describe('HttpService', () => {
  let service: HttpService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(HttpService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request upload links for all selected images in one batch', async () => {
    const responsePromise = service.generateUploadImageLinksAsync(
      'project-id',
      [
        {fileName: 'one.png', width: 20, height: 10},
        {fileName: 'two.jpg', width: 40, height: 30}
      ]
    );
    const request = httpController.expectOne(
      `${Uris.baseUrl}/api/projects/data/generate-upload-image-link`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      projectId: 'project-id',
      images: [
        {imageDetails: {fileName: 'one.png', width: 20, height: 10}},
        {imageDetails: {fileName: 'two.jpg', width: 40, height: 30}}
      ]
    });

    const uploads: GeneratedImageUpload[] = [];
    request.flush({uploads});
    expect((await responsePromise).body?.uploads).toEqual(uploads);
  });

  it('should upload to the generated URL and report progress', async () => {
    const uploadLink: ImageUploadLink = {
      imageId: 'image-id',
      storageKey: 'uploads/original/image-id',
      uploadUrl: 'http://upload.test/image-id?token=signed',
      method: 'POST'
    };
    const file = new File(['image'], 'image.png', {type: 'image/png'});
    let progress = 0;
    const responsePromise = service.uploadImageAsync(
      uploadLink,
      file,
      (value: number) => progress = value
    );
    const request = httpController.expectOne(uploadLink.uploadUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    expect((request.request.body as FormData).get('image')).toBe(file);
    request.event({
      type: HttpEventType.UploadProgress,
      loaded: 5,
      total: 10
    });
    expect(progress).toBe(50);

    request.flush({
      imageId: 'image-id',
      storageKey: 'uploads/original/image-id',
      bytesUploaded: file.size
    });
    expect((await responsePromise).body?.imageId).toBe('image-id');
  });

  it('should finalize the uploaded image', async () => {
    const responsePromise = service.completeImageUploadAsync('image-id');
    const request = httpController.expectOne(
      `${Uris.baseUrl}/api/projects/data/complete-image-upload`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({imageId: 'image-id'});
    request.flush('image-id');

    expect((await responsePromise).body).toBe('image-id');
  });
});

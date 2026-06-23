import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly pendingLoads = new Map<string, Promise<HTMLImageElement>>();

  load(url: string): Promise<HTMLImageElement> {
    const cachedImage: HTMLImageElement | undefined = this.images.get(url);
    if (cachedImage) {
      return Promise.resolve(cachedImage);
    }

    const pendingLoad: Promise<HTMLImageElement> | undefined = this.pendingLoads.get(url);
    if (pendingLoad) {
      return pendingLoad;
    }

    const image: HTMLImageElement = new Image();
    const loadPromise: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      image.onload = () => {
        this.images.set(url, image);
        this.pendingLoads.delete(url);
        image.onload = null;
        image.onerror = null;
        resolve(image);
      };
      image.onerror = () => {
        this.pendingLoads.delete(url);
        image.onload = null;
        image.onerror = null;
        reject(new Error(`Failed to load image: ${url}`));
      };
      image.src = url;
    });

    this.pendingLoads.set(url, loadPromise);
    return loadPromise;
  }

  invalidate(url: string): void {
    this.images.delete(url);
    this.pendingLoads.delete(url);
  }
}

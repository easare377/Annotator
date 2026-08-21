/**
 * Uploads an image to the configured storage provider and optionally reports
 * the percentage of bytes transferred, from 0 through 100.
 *
 * Type parameters keep the contract independent of the current Django API so
 * it can also be implemented by an S3 or other direct-storage uploader.
 */
export interface IImageUploadHandler<TUploadRequest, TUploadResult> {
  uploadAsync(
    request: TUploadRequest,
    image: File,
    onProgress?: (progress: number) => void,
  ): Promise<TUploadResult>;
}

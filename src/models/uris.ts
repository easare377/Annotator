export class Uris {
  private static _serverUrl = "http://ec2-3-10-22-161.eu-west-2.compute.amazonaws.com:7000";
  private static _localUrl = "http://127.0.0.1:8000";

  private static _baseUrl = Uris._localUrl;
  private static _projectsUrl = Uris._baseUrl + "/api/projects";
  private static _createProjectUrl = Uris._baseUrl + "/api/create-project";
  private static _projectDataUrl = Uris._baseUrl + "/api/projects/data";
  private static _uploadImageUrl = Uris._baseUrl + "/api/projects/data/upload-image"
  private static _imagePolygonsUrl = Uris._baseUrl + "/api/projects/data/polygons";
  private static _generatePolygonsUrl = Uris._baseUrl + "/api/projects/data/generate-polygons";
  private static _annotateImageUrl = Uris._baseUrl + "/api/projects/data/annotate-image";
  private static _exportProjectUrl = Uris._baseUrl + "/api/projects/data/export/segmentation-mask";
  private static _exportProjectAsJsonUrl = Uris._baseUrl + "/api/projects/data/export/json";
  private static _exportProjectAsVocUrl = Uris._baseUrl + "/api/projects/data/export/export-data-voc";
  private static _deleteImageUrl=Uris._baseUrl+"/api/projects/delete-image";

  static get baseUrl(): string {
    return this._baseUrl;
  }
  static get deleteImageUrl():string{
    return this._deleteImageUrl
  }

  static get createProjectUrl(): string {
    return this._createProjectUrl;
  }

  static get projectsUrl(): string {
    return this._projectsUrl;
  }

  static get projectDataUrl(): string {
    return this._projectDataUrl;
  }

  static get uploadImageUrl(): string {
    return this._uploadImageUrl;
  }

  static get imagePolygonsUrl(): string{
    return this._imagePolygonsUrl;
  }

  static get generatePolygonsUrl(): string{
    return this._generatePolygonsUrl;
  }

  static get annotateImageUrl(): string {
    return this._annotateImageUrl;
  }

  static get exportProjectUrl(): string{
    return this._exportProjectUrl;
  }

  static get exportProjectAsJsonUrl(): string {
    return this._exportProjectAsJsonUrl;
  }

  static get exportProjectAsVocUrl(): string{
    return this._exportProjectAsVocUrl;
  }
}

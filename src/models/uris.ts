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
  private static _exportProjectUrl = Uris._baseUrl + "/api/projects/data/export";

  static get baseUrl(): string {
    return this._baseUrl;
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
}

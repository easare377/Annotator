import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly dataUrl = 'assets/data/polygons.json';  // Path to the JSON file
  constructor(private http: HttpClient) {

  }

  private getRequestHeaders(): HttpHeaders{
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  // Method to fetch data
  async getJsonDataAsync(): Promise<Promise<Array<Array<Array<number>>>>> {
    // return await this.http.get<Array<Array<number>>>(this.dataUrl);
    try {
      return await firstValueFrom(this.http.get<Array<Array<Array<number>>>>(this.dataUrl));
    } catch (error) {
      console.error('Error fetching JSON data:', error);
      return [];
    }
  }
}

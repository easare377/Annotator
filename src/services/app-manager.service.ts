import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class AppManagerService {
  private stateMap = new Map<string, string>();

  addData(key: string, value: string): void {
    this.stateMap.set(key, value);
  }

  getData(key: string): any {
    return this.stateMap.get(key);
  }

  removeData(key: string): boolean {
    return this.stateMap.delete(key);
  }
}


import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private lastSearchRoute: string = '';
  private searchData: any[] = [];
  private stateKey = 'searchState';
  
  setLastSearchRoute(route: string): void {
    this.lastSearchRoute = route;
  }

  getLastSearchRoute(): string {
    return this.lastSearchRoute;
  }

  saveHtmlState(data: any): void {
    //sessionStorage.setItem(this.stateKey, JSON.stringify(data));
    if (typeof window !== 'undefined' && window.sessionStorage) {
      console.log('Data in saveHTmlState stored is:',data);
      sessionStorage.setItem(this.stateKey, JSON.stringify(data)); //Refered ChatGPT
    }
  }

  getHtmlState(): any {
    //const data = sessionStorage.getItem(this.stateKey);
    //return data ? JSON.parse(data) : null;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const data = sessionStorage.getItem(this.stateKey); //Refered ChatGPT
      console.log('Data saved to getHtmlState**********:', data);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
  clearState(): void {
    console.log('Clearing state...');
    sessionStorage.removeItem(this.stateKey);
    console.log('State after clearing:', sessionStorage.getItem(this.stateKey));
  }
 
}

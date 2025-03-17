import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private backendUrl = 'https://webproject3-415519.wn.r.appspot.com/PortfolioInfo';

    constructor(private http: HttpClient) { }

    getWatchlist(): Observable<any[]> {
        return this.http.get<any[]>(this.backendUrl);
    }
}
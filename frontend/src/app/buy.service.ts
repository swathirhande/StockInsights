import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BuyService {

    private backendUrl = 'https://webproject3-415519.wn.r.appspot.com';

    constructor(private http: HttpClient) { }

  getCashBalance(): Observable<number> {
    return this.http.get<{ cashBalance: number }>(`${this.backendUrl}/cashbalance`).pipe(
        map(response => response.cashBalance)
    );
}


}

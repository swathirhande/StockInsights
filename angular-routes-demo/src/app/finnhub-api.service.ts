import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface AutocompleteItem {
  displaySymbol: string;
  // Add other properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class FinnhubApiService {

  constructor(private http: HttpClient) {}
  
  getAutocompleteData(query: string) : Observable<any[]> {
    let queryInput =query.toUpperCase();
     console.log('Fetching autocomplete data...');
     console.log('value of query is',query);
     const url = `https://finnhub.io/api/v1/search?q=${queryInput}&token=cms5fs1r01qlk9b12bc0cms5fs1r01qlk9b12bcg`;
     console.log('Value of the url is',url)
     console.log('Response from the url is',this.http.get(url));
     console.log('for input',query);
     
     
     return this.http.get(url).pipe(
      map(response => {
        // Log the response in the map operator
        console.log('Response from the API:', response);
        const results = (response as any).result;
        console.log('Results:', results);
       if (results && Array.isArray(results)) {
        const filteredResults = results.filter((result: any) => {
          return result.displaySymbol.toUpperCase().startsWith(queryInput);
        });
        console.log('Filtered results:', filteredResults);
        // Map the filtered results to the desired format
        const mappedResults = filteredResults.map((result: any) => ({
          description: result.description,
          displaySymbol: result.displaySymbol
        }));
        console.log('Mapped results:', mappedResults);
        return mappedResults;

         } else {
      throw new Error('Invalid response format. Expected an array within a "result" property.');
    }
  }),
     
      catchError(error => {
        console.error('Error fetching autocomplete data:', error);
        return throwError('Failed to fetch autocomplete data');
      })
    );
  }
}

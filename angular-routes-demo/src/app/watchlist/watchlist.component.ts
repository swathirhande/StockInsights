import { Component, OnInit} from '@angular/core';
import { WatchlistService } from '../watchlist.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SearchService } from '../search.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent implements OnInit {
  documents: any[] = [];
  isLoading: boolean = true;
  backendUrl = environment.backendUrl;
  constructor(private watchlistService: WatchlistService, private router: Router, private http: HttpClient, private searchService: SearchService) { }

  ngOnInit(): void {
      this.getWatchlist();
  }

  getWatchlist(): void {
      this.watchlistService.getWatchlist()
          .subscribe(documents => {
              this.documents = documents;
              this.isLoading = false;
          });
  }

  navigateToSearch(ticker: string, event: Event) : void  {
    this.searchService.setLastSearchRoute('/search/' + ticker);
    this.router.navigate(['/search', ticker]);
  }
  removeDocument(index: number, document: any, event: Event) {
    event.stopPropagation(); 
    this.documents.splice(index, 1); 
    this.sendDetailsToDelete(document); 
  }

  sendDetailsToDelete(document: any)
  {
    const params = { _id: document._id };
    console.log('Sending document ID to delete:', params);
    const endpoint = `${this.backendUrl}/endpoint`;
    
    this.http.get(endpoint, { params: params }).subscribe({
      next: (response) => {
        console.log('Document ID sent successfully', response);
      },
      error: (error) => {
        console.error('Error sending document ID', error);
      }
    });
  }
}






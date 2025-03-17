import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-routes-demo';
  //constructor() {}
}






















/* CODE THAT WORKS:
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Route  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {SearchingtabComponent} from './searchingtab/searchingtab.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-routes-demo';
}
*/


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SearchingtabComponent} from './searchingtab/searchingtab.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
const appRoutes: Routes = [
  { path: '', redirectTo: '/search/home', pathMatch: 'full' },
 { path: 'search/home', component: SearchingtabComponent  },
  { path: 'search/:ticker', component: SearchingtabComponent },
  {path: 'watchlist', component:WatchlistComponent},
  {path: 'portfolio', component:PortfolioComponent},
  {path: 'portfolio/', component:PortfolioComponent},
  { path: '**', redirectTo: '/search/home' },
];
@NgModule({
  imports: [RouterModule.forRoot(appRoutes,{enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

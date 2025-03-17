import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Router, RouterModule, Routes} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SearchingtabComponent} from './searchingtab/searchingtab.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { FinnhubApiService } from './finnhub-api.service';
import { CommonModule } from '@angular/common';
import {AsyncPipe} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SearchingtwotabComponent } from './searchingtwotab/searchingtwotab.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';

const appRoutes: Routes = [
  { path: '', redirectTo: '/search/home', pathMatch: 'full' },
  { path: 'search/home', component: SearchingtabComponent },
  { path: 'search/:ticker', component: SearchingtabComponent },
  {path: 'watchlist', component:WatchlistComponent},
  {path: 'portfolio', component:PortfolioComponent},
  { path: '**', redirectTo: '/search/home' },
];
@NgModule({
  imports: [
    BrowserModule, BrowserAnimationsModule, FormsModule, NgbModule,
    HttpClientModule,RouterModule.forRoot(appRoutes,{enableTracing: true}),
    FormsModule,CommonModule,
    ReactiveFormsModule,MatOptionModule,
    MatFormFieldModule, MatAutocompleteModule, MatInputModule,AsyncPipe,ReactiveFormsModule,MatIconModule,MatSelectModule,  MatTabsModule, NgbToastModule, HighchartsChartModule], // AppRoutingModule,
  declarations: [
    AppComponent,
    SearchingtabComponent,
    WatchlistComponent,
    PortfolioComponent,
    SearchingtwotabComponent
  ],
  providers:  [FinnhubApiService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(router: Router)
  {

  }
}

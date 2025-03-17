import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms'; 
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { SearchService } from '../search.service';
import { BuyService } from '../buy.service';
import { PortfolioService } from '../portfolio.service';
import axios from 'axios';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as Highcharts from 'highcharts/highstock';
import HC_exporting from 'highcharts/modules/exporting'; 
import indicators from 'highcharts/indicators/indicators';
import volumeByPrice from 'highcharts/indicators/volume-by-price';
import { environment } from '../../environments/environment';
import { marked } from 'marked'; 
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface AutocompleteItem {
  displaySymbol: string;
  description: string;
}
interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}
interface InsightItem {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}
interface ResultChart {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}
interface EarningItem {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}
interface HourlyData {
  c: number;
  t: number;
}
interface RecommendationItem {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  period: string;
}
@Component({
  selector: 'app-searchingtab',
  templateUrl: './searchingtab.component.html',
  styleUrl: './searchingtab.component.css'
})



export class SearchingtabComponent implements OnInit, OnDestroy{

  userQuery: string = '';
  aiResponse: SafeHtml = '';
  isChatLoading: boolean = false;
  
  showAlert: boolean = false;
  selectedNews: any;
  Highcharts: typeof Highcharts = Highcharts; 
  chartOptions?: Highcharts.Options = {};
 
  updateFlag: boolean = false; 
  oneToOneFlag: boolean = true; 
 runOutsideAngular: boolean = false; 

 private updateSubscription!: Subscription;
 savedState: any;
  isStarActive: boolean = false;
  marketOpenNow: boolean = false;

  public totalMspr: number = 0;
  public totalChange: number = 0;
  public positiveMspr: number = 0;
  public positiveChange: number = 0;
  public negativeMspr: number = 0;
  public negativeChange: number = 0;
  formattedMspr!: string;
  formattedpositiveMspr!: string;
  formattednegativeMspr!: string;
  showNotification: boolean = false;
  showsellNotification: boolean = false;
  totalQuantityPurchased: number = 0;
  notificationMessage: string = '';
  sellnotificationMessage: string = '';
 
  public savedHourlyValues: Array<{ c: number; t: string }> = [];
  public finalDetails: Array<{ c: number; t: string}> = [];
  cashBalance: number = 0;
  quantity: number = 0;
  total: number = 0;
  buyButtonDisabled: boolean = true;
  sellButtonDisabled: boolean = true;
  isLoading: boolean = false;
  isBuffering: boolean =false;
  valueCanChange: boolean =false;
  isSell: boolean = false;
  documents: any[] = [];
  displayNews: NewsItem[] = [];
  extractedData: Array<{ c: number; t: number }> = [];
  alert: { type: string, message: string } | null = null;
  backendUrl = environment.backendUrl;
  toggleStar(): void {
    this.isStarActive = !this.isStarActive;
    if (this.isStarActive) {
      this.showAlert = true;
      setTimeout(() => {
        this.showAlert = false;
      }, 2000); 
    }
    
    console.log('INSIDE TOGGLESTAR FUNCTION AND TICKER VALUE SENT IS',this.profile.ticker);
    if(this.isStarActive)
    {
    try {
      const requestData = {
          ticker: this.profile.ticker,
          name: this.profile.name,
          c: this.quote.c,
          d: this.quote.d,
          dp: this.quote.dp
      };

      axios.get(`${this.backendUrl}/toggleStar`, { params: requestData })
          .then((response) => {
              console.log('Data sent successfully to MongoDB', response.data);
          })
          .catch((error) => {
            
              console.error('Error occurred while sending data to MongoDB:', error);
          });
  } catch (error) {
      
      console.error('Error occurred:', error);
  } }
  else{
    console.log('Star ticker removed');
    console.log('Value of star ticker is:',this.isStarActive);
    this.http.get<any>(`${this.backendUrl}/deleteStarTicker?ticker=${this.profile.ticker}`)
  .subscribe({
    next: (response) => {
      console.log('Delete successful', response);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });

  }
  };

  formattedCurrentDate: string;
  
  
  searchData: any;
  userInput: string = ''; 
  usersIn: string = '';
  profile: any;
  quote: any;
  peer: any;
  charts: any;
  news:any;
  insights: any;
  recommendation: any;
  earning: any;
  hourlyDetails: any;
  hourlyinfo: any
  showSpinnerInsideOptions: boolean = true;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  showCompanyDetails: boolean = false;
  showCompleteDetails: boolean =true;
  errorMessage: string | null = null;
  errorMsg1 = "";
  filteroptions:AutocompleteItem[] = [];
  searchTerm: FormControl = new FormControl('');
  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private modalService: NgbModal, 
    private searchService: SearchService, 
    private buyService: BuyService, 
    private portfoliodetails: PortfolioService,
    private sanitizer: DomSanitizer
  ) 
  {
    this.formattedCurrentDate = this.formatCurrentDate();
  }
 
  ngOnInit(): void { 
     /*HC_exporting(Highcharts);
     indicators(Highcharts);
     volumeByPrice(Highcharts);*/
     if (typeof Highcharts !== 'undefined') {
      try {
        HC_exporting(Highcharts);
        indicators(Highcharts);
        volumeByPrice(Highcharts);
      } catch (error) {
        console.error('Error initializing Highcharts modules:', error);
      }
    } else {
      console.error('Highcharts is not defined');
    }
    const lastSearchRoute = this.searchService.getLastSearchRoute();
    this.getCashBalance(); 
    
    if (lastSearchRoute) {
      this.router.navigateByUrl(lastSearchRoute);
     }   

    
    this.savedState = this.searchService.getHtmlState();
    if (this.savedState) {
      this.marketOpenNow = this.savedState.marketOpenNow;
      this.quote = this.savedState.quote;
      this.profile = this.savedState.profile;
      this.peer = this.savedState.peer,
      this.charts = this.savedState.charts,
      this.news = this.savedState.news,
      this.insights = this.savedState.insights,
      this.recommendation = this.savedState.recommendation,
      this.earning = this.savedState.earning
    }

    this.getNames();
    const tickerFromSnapshot = this.route.snapshot.paramMap.get('ticker');


this.route.paramMap.subscribe(params => {
  const ticker = params.get('ticker');
  if (ticker) {
    this.userInput = ticker;
    this.check(ticker);
  }
});


  }



ngOnDestroy(): void {
  if (this.updateSubscription) {
    this.updateSubscription.unsubscribe();
  }
}


 
 saveCurrentState(): void {
  const currentState = {
    marketOpenNow: this.marketOpenNow,
    quote: this.quote,
    profile: this.profile,
    peer: this.peer,
    charts: this.charts,
    news: this.news,
    insights: this.insights,
    recommendation: this.recommendation,
    earning :this.earning,
    hourlyinfo : this.finalDetails,
  };
  this.searchService.saveHtmlState(currentState);

}
 

getNames() {
  console.log("Function getNames()")
  this.searchTerm.valueChanges.pipe(
    startWith(''),
    debounceTime(30),
    distinctUntilChanged(),
    switchMap(value => {
      if (typeof value === 'string' && value.length > 0) {
        return this.http.get<any[]>(`${this.backendUrl}/autocomplete/` + value);
      } else {
        return [];
      }
    }),
  ).subscribe(response => {
    
    this.filteroptions = response.filter(option => !option.displaySymbol.includes('.'));
    this.showSpinnerInsideOptions = false;
  });
}




 onEnter() {
  if (this.autocompleteTrigger) {
    this.autocompleteTrigger.closePanel();
  }
}


optionClicked(event: MouseEvent): void {
 event.stopPropagation();
this.search(event);
}


search(event: Event) {
   event.preventDefault(); 
   this.isBuffering =true;
   const userInput = this.userInput.trim().toUpperCase(); 
  if (!userInput) {
    this.errorMessage = "Please enter a valid ticker";
    this.isBuffering = false;

    return; 
  }
  this.router.navigate(['/search', userInput]);
  this.searchService.setLastSearchRoute('/search/' + userInput);
}

    clearSearch(event: Event) {
        this.profile = {}; 
        this.quote = {}; 
        this.userInput = '';
        this.errorMessage= ''; 
        this.searchService.clearState();
        event.preventDefault(); 
        this.searchService.setLastSearchRoute('/search/home');
        this.router.navigate(['/search/home']);  
      }
  
    check(ticker: string) {
      this.isBuffering = true;
      this.getTickerInfo(ticker);
      if (this.savedState && this.savedState.profile.ticker == ticker) {
        const userInput = ticker.toUpperCase(); 
        this.HourlyChartInfo(userInput);
        this.marketOpenNow = this.savedState.marketOpenNow;
        this.quote = this.savedState.quote;
        this.profile = this.savedState.profile;
        this.peer = this.savedState.peer,
        this.charts = this.savedState.charts,
        this.news = this.savedState.news,
        this.insights = this.savedState.insights,
        this.recommendation = this.savedState.recommendation,
        this.earning = this.savedState.earning
        if(this.profile && this.quote && Object.keys(this.profile).length > 0 && Object.keys(this.quote).length > 0)
        {
          this.searchService.setLastSearchRoute('/search/' + userInput);
          this.errorMessage = null;
          this.getWatchlist(userInput);
          this.marketOpenNow = this.currentStatusOfMarketOpen();
          this.fetchData(this.userInput); 
          this.saveCurrentState();              
    } else {
          this.showCompanyDetails = true;
          
         this.errorMessage = "No data found for the provided ticker."; 
         this.searchService.setLastSearchRoute('/search/' + userInput);
         this.saveCurrentState();            
        }
        this.isBuffering=false;
        return;
      }  
     this.route.paramMap.subscribe(params => {
        const ticker = params.get('ticker');
        if (ticker) {
          this.userInput = ticker;
        }
      });
      const userInput = ticker.toUpperCase(); 
      this.http.get<any>(`${this.backendUrl}/searchs/${userInput}`).subscribe({
        next: (response) => {
          this.isBuffering=false;
          this.profile = response.profile;
          this.quote = response.quote;
         this.peer = response.peer.filter((peer: string) => !peer.includes('.'));
          this.charts = response.charts;
          this.news = response.news;
          this.insights =response.insights;
          this.recommendation = response.recommendation;
          this.earning = response.earing;
         if(this.profile && this.quote && Object.keys(this.profile).length > 0 && Object.keys(this.quote).length > 0)
          {
           this.searchService.setLastSearchRoute('/search/' + userInput);
            this.errorMessage = null;
            this.getWatchlist(userInput);
            this.marketOpenNow = this.currentStatusOfMarketOpen();
            this.HourlyChartInfo(userInput);
           this.fetchData(this.userInput); 
           this.saveCurrentState();                
      } else {
            this.showCompanyDetails = true;
            this.errorMessage = "No data found. Please enter a valid Ticker"; 
            this.searchService.setLastSearchRoute('/search/' + userInput);
            this.saveCurrentState();            
          }
        },
        
        error: (error) => {
          console.error('Search error:', error);
          this.errorMessage = "Polygon.io can only process 5 requests/min"; 
        }
      }); 

    }

    fetchData(userInput: string): void {
      this.http.get<any>(`${this.backendUrl}/autorefresh/${userInput}`).subscribe({
        next: (response) => {
          this.quote = response;
          this.marketOpenNow = this.currentStatusOfMarketOpen();
          if (this.marketOpenNow) {
            this.setupAutoRefresh(userInput);
          }
        },
        error: (error) => {
          console.error('Error fetching data: ', error);
        }
      });
    }
    setupAutoRefresh(userInput: string): void {
      if (this.updateSubscription) {
        this.updateSubscription.unsubscribe(); 
      }
      this.updateSubscription = interval(15000).subscribe(() => {
        if (this.currentStatusOfMarketOpen()) {
          this.fetchData(userInput); 
        }
      });
    }

    getWatchlist(userInput: string): void {
      this.portfoliodetails.getWatchlist()
          .subscribe(documents => {
              this.documents = documents;
              this.isSell = false;
              this.documents.forEach(document => {
                if (document.tickerSymbol === userInput) {
                  this.isSell = true;
                }
              });
              this.isLoading = true;
          });
    }


    tabChanged(event: MatTabChangeEvent) {
      if(event.tab.textLabel === 'Summary')
      {
        this.getFormattedHourlyDetails();
      }
      if (event.tab.textLabel === 'Charts') {
        this.getChartsDetails();
      }
      if (event.tab.textLabel === 'Top News') {
        this.getNews();
      }
      if(event.tab.textLabel === 'Insights')
      {
        this.getInsights();
      }
    }
    getChartsDetails()
    {
      type DataPoint = [number, number, number, number, number, number];
      console.log(Highcharts);
      const chartsData: DataPoint[] = [];
      this.charts.results.forEach((result: ResultChart) => {
      const date: number = result.t;
      const open: number = result.o;
      const high: number = result.h;
      const low: number = result.l;
      const close: number = result.c;
      const volume: number =result.v ;
      chartsData.push([date, open, high, low, close, volume]);
});

let ohlc: [number, number, number, number, number][] = [];
let volume: [number, number][] = [];

chartsData.forEach((dataPoint: number[]) => {
  const date: number = dataPoint[0];
  const open: number = dataPoint[1];
  const high: number = dataPoint[2];
  const low: number = dataPoint[3];
  const close: number = dataPoint[4];
  const volumeValue: number = dataPoint[5]; 
  ohlc.push([date, open, high, low, close]);
  volume.push([date, volumeValue]);
});

const chart = Highcharts.stockChart('containerChart', {
  chart: {
    height: 550,
    backgroundColor: '#f8f9fa',
  },
  rangeSelector: {
  selected: 2,
    buttons: [{
      type: 'month',
      count: 1,
      text: '1m',
      title: 'View 1 month',
      events: {
        click: function(e) {
        chart.yAxis[1].update({
            tickPositions: [0, 50e6, 100e6, 150e6]
          });
          chart.update({
            plotOptions: {
              column: {
                pointWidth: 20
              }
            }
          });
        }
      }
    }, {
      type: 'month',
      count: 3,
      text: '3m',
      title: 'View 3 months',
       events: {
        click: function(e) {
        chart.yAxis[1].update({
            tickPositions: [0, 50e6, 100e6, 150e6]
          });
          chart.update({
            plotOptions: {
              column: {
                pointWidth: 8
              }
            }
          });
        }
        }
    }, {
      type: 'month',
      count: 6,
      text: '6m',
      title: 'View 6 months',
       events: {
        click: function(e) {
        chart.yAxis[1].update({
            tickPositions: [0, 50e6, 100e6, 150e6]
          });
          chart.update({
            plotOptions: {
              column: {
                pointWidth: 5
              }
            }
          });
        }
        }
    }, {
      type: 'ytd',
      text: 'YTD',
      title: 'View year to date',
      events: {
        click: function(e) {
          chart.update({
            plotOptions: {
              column: {
                pointWidth: 12
              }
            }
          });
          }
          }
    }, {
      type: 'year',
      count: 1,
      text: '1y',
      title: 'View 1 year',
      events: {
        click: function(e) {
                    chart.yAxis[1].update({
            tickPositions: [0, 50e6, 100e6, 150e6]
          });

          chart.update({
            plotOptions: {
              column: {
                pointWidth: 2
              }
            }
          });
          } }     
      
    }, {
      type: 'all',
      text: 'All',
      title: 'View all',
      events: {
        click: function(e) {
              chart.yAxis[1].update({
            tickPositions: [0, 250e6, 500e6, 750e6]
          });

          chart.update({
            plotOptions: {
              column: {
                pointWidth: 5
              }
            }
          });
          }
          }
    }]
  },
  title: {
    text: `${this.profile.ticker} Historical`
  },

  subtitle: {
    text: 'With SMA and Volume by Price technical indicators'
  },
  xAxis: {
    type: 'datetime'
  },

  yAxis: [{
    startOnTick: false,
    endOnTick: false,
    labels: {
      align: 'right',
      x: -3
    },
    title: {
      text: 'OHLC'
    },
    height: '60%',
    lineWidth: 2,
    resize: {
      enabled: true
    },
    tickPositions: (() => {
      const ohlcValues = ohlc.map(point => [point[2], point[3]]).flat(); 
      const min = Math.min(...ohlcValues);
      const max = Math.max(...ohlcValues);
      let positions = [];
      let interval = (max - min) / 5; 
  
      for (let i = min; i <= max; i += interval) {
          positions.push(parseFloat(i.toFixed(2))); 
      }
  
      console.log("Min:", min, "Max:", max, "Tick positions:", positions);
      return positions;
    })(),
  }, {
    labels: {
      align: 'right',
      x: -3
    },
    title: {
      text: 'Volume'
    },
    top: '65%',
    height: '35%',
    offset: 0,
    lineWidth: 2,
    tickPositions: [0, 50e6, 100e6, 150e6]
  }],
  series: [{
    type: 'candlestick',
    name: 'AAPL',
    id: 'aapl',
    zIndex: 2,
    data: ohlc
  }, {
    type: 'column',
    name: 'Volume',
    id: 'volume',
    data: volume,
    yAxis: 1
  }, {
    type: 'vbp',
    linkedTo: 'aapl',
    params: {
      volumeSeriesID: 'volume'
    },
    dataLabels: {
      enabled: false
    },
    zoneLines: {
      enabled: false
    }
  }, {
    type: 'sma',
    linkedTo: 'aapl',
    zIndex: 1,
    marker: {
      enabled: false
    }
  }],
  exporting: {
    enabled: false
  }
});

    }
    
    getNews(){
      this.displayNews = [];

      for (const item of this.news) {
          if (item.image && item.headline && this.displayNews.length < 20) { 
          this.displayNews.push(item);
        }
      }
    }
    
    getInsights()
  { 
    this.totalMspr = 0;
    this.totalChange = 0;
    this.positiveMspr = 0;
    this.positiveChange = 0;
    this.negativeMspr = 0;
    this.negativeChange = 0;
    this.insights.data.forEach((item: InsightItem) => {
      this.totalMspr += item.mspr;
      this.totalChange += item.change;
  
      if (item.mspr > 0) {
        this.positiveMspr += item.mspr;
        this.positiveChange += item.change;
      } else if (item.mspr < 0) {
        this.negativeMspr += item.mspr;
        this.negativeChange += item.change;
      }
    });
    this.formattedMspr = (Math.floor(this.totalMspr * 100) / 100).toFixed(2);
    this.formattedpositiveMspr = (Math.floor(this.positiveMspr * 100) / 100).toFixed(2);
    this.formattednegativeMspr = (Math.floor(this.negativeMspr * 100) / 100).toFixed(2);
    this.chartOptions = { 
      chart: {
        type: 'column',
        backgroundColor: '#f8f9fa',

      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: this.recommendation.map((item: RecommendationItem) => item.period),
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis'
        },
        stackLabels: {
          enabled: false,
          style: {
            fontWeight: 'bold',
            color: ( 
             Highcharts.defaultOptions.title?.style?.color
            ) || 'gray'
          }
        }
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [{
        type: 'column', 
        name: 'Strong Buy',
        color: '#2c6e49',
        data: this.recommendation.map((item: RecommendationItem) => item.strongBuy)
      }, {
        type: 'column',
        name: 'Buy',
        color: '#2dc653',
        data: this.recommendation.map((item: RecommendationItem) => item.buy)
      }, {
        type: 'column',
        name: 'Hold',
        color: '#b39c4d',
        data: this.recommendation.map((item: RecommendationItem) => item.hold)
      }, {
        type: 'column',
        name: 'Sell',
        color: '#dc2f02',
        data: this.recommendation.map((item: RecommendationItem) => item.sell)
      }, {
        type: 'column',
        name: 'Strong Sell',
        color: '#6a040f',
        data: this.recommendation.map((item: RecommendationItem) => item.strongSell)
      }],
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    };
  
    Highcharts.chart('recommendationContainer', this.chartOptions);
    const categories = this.earning.map((item: EarningItem) =>  `${item.period}<br>Surprise: ${item.surprise.toFixed(2)}`);
    console.log('Value of suprises is:',categories);
    const actualData = this.earning.map((item: EarningItem)=> item.actual);
    const estimateData = this.earning.map((item: EarningItem) => item.estimate);

    this.chartOptions = {
      chart: {
        type: 'spline',
        backgroundColor: '#f8f9fa'
      },
      title: {
        text: 'Historical EPS Suprises'
      },
      xAxis: {
        categories: categories,
      
      },
      yAxis: {
        title: {
          text: 'Quarterly EPS'
        },
      },
      plotOptions:
      {
        area:
        {
        fillOpacity:0.5
        }
      },
      tooltip : {
        shared: true,
     },
      series: [{
       type: 'spline', 
        name: 'Actual',
        data: actualData,
        color: '#4cc9f0',
      }, {
        type: 'spline', 
        name: 'Estimate',
        data: estimateData,
        color: '#3a0ca3',
      }],
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    };

    Highcharts.chart('earningContainer', this.chartOptions);
  }
  
    isMarketOpen(): boolean {
      const currentTimeStamp = Math.floor(Date.now() / 1000); 
      const difference = currentTimeStamp - this.quote.t;
       return difference <= 100; 
    }


    HourlyChartInfo(userInput: string)
    {
      const userInputs = userInput;
      console.log('The userInput value inside HourlyChartInfo is:',userInputs);
      const currentTimeStamp = Math.floor(Date.now() / 1000); 
      const difference = currentTimeStamp - this.quote.t;
      console.log('Difference is:',difference);
      const quotePrice = this.formatYeardate(this.quote.t);
      this.getHourlyChart(difference,currentTimeStamp, quotePrice, userInputs);
    }
    getHourlyChart(difference: number, currentTimeStamp: number, quotePrice: string, userInputs: string): void {
      if(difference <= 100)
      {
        const userValue = userInputs;
        const to = this.formatYeardate(currentTimeStamp);
        const from = this.getPreviousDate(to);
        this.http.get<any>(`${this.backendUrl}/getHourlyChart?from=${from}&to=${to}&userInput=${userValue}`)
        .subscribe(response => {
          this.hourlyDetails = response;
          if (this.hourlyDetails && this.hourlyDetails.results) {
            this.extractedData = this.hourlyDetails.results.map((result: any) => ({ c: result.c, t: result.t }));
            this.valueCanChange =true;
            console.log('The value of valueCanChange is:',this.valueCanChange);
          }
          else{
            console.log('Not executed if block');
          }
        }, error => {
          console.error('Error:', error);
        });
      } 
      if(difference > 100)
      {
        const userValue = userInputs;
        const to = this.formatYeardate(currentTimeStamp);
        const from = this.getPreviousDate(quotePrice);
        this.http.get<any>(`${this.backendUrl}/getHourlyChart?from=${from}&to=${to}&userInput=${userValue}`)
        .subscribe(response => {  
          this.hourlyDetails = response;
          if (this.hourlyDetails && this.hourlyDetails.results) {
            this.extractedData = this.hourlyDetails.results.map((result: any) => ({ c: result.c, t: result.t }));
            this.valueCanChange =true;
          }
          else{
            console.log('Not executed if block');
          }
        }, error => {
          console.error('Error:', error);
        });  
      }
   
    }


    getFormattedHourlyDetails(): void {
      if (!this.valueCanChange) {
        setTimeout(() => this.getFormattedHourlyDetails(), 1000);
        return;
      }
      let previousDate: string | null = null;
     
const indicesToStore = [0, 2, 4, 6, 8, 10, 14]; 
this.extractedData.forEach((result: { c: number; t: number }, index: number) => {
    if (indicesToStore.includes(index)) {
        const date = new Date(result.t);
        let formattedDate: string;
        const dateOptions: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Los_Angeles',
            month: 'short',
            day: 'numeric',
            hour12: false
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Los_Angeles',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const currentDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
        if (previousDate !== currentDate) {
            formattedDate = currentDate;
            previousDate = currentDate;
        } else {
            formattedDate = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
        }

        this.finalDetails.push({ c: result.c, t: formattedDate });
    }
});
      const currentTime = Math.floor(new Date().getTime() / 1000);
      const difference = currentTime - this.quote.t;
      const lineColor = difference <= 120 ? 'green' : 'red';
      const seriesData= this.finalDetails.map(details => ({
        name: details.t,
        y: details.c
      }));
      const timeLabels = seriesData.map(point => point.name);
      console.log('Series data is:',seriesData);
      this.chartOptions ={
        chart:
        {
          type: 'line',
          backgroundColor: '#f8f9fa',
          height: '300px',
          spacingBottom: 0
        },
        title :
        {
          text:`${this.profile.ticker} Hourly Price Variation`,
          style: {
            fontSize: '14px',
            color: 'grey'
          }
        },
        xAxis:
        {
        min: 0,
       tickWidth: 1, 
       tickColor: 'black',
          scrollbar:
          {
            enabled: true,  
          },
          labels:
          {
            formatter: function() {

              if (typeof this.value === 'number') {  
                return timeLabels[this.value];
              } else if (typeof this.value === 'string') {
                return this.value;
              }
              return ''; 
            },
            
          }
          
        },
         legend :
        {
          symbolWidth: 0
        },
        yAxis:
        {
          opposite: true,
          title: {
            text: ''
          }
        },
        credits: {
          position: {
            align: 'right',
            verticalAlign: 'bottom',
            y: -20 
          }
        },
        series: [{
          name: '',
          type: 'line',
          data: seriesData,
          color: lineColor,
          marker: {
            enabled: false
          }
        }],
        exporting: {
          enabled: false
        }
      };
      Highcharts.chart('hourlyContainer', this.chartOptions);
    }

    formatYeardate(timestamp: number): string {
      const milliseconds = timestamp * 1000;
      const date = new Date(milliseconds);
      const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'America/Los_Angeles'
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
      const year = parts.find(part => part.type === 'year')?.value;
      const month = parts.find(part => part.type === 'month')?.value;
      const day = parts.find(part => part.type === 'day')?.value;
      if (year && month && day)
      {
          return `${year}-${month}-${day}`;
      } 
      else 
      {
          return 'Invalid Date';
      }
  }
  getPreviousDate(currentDate: string): string {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0'); 
    return `${year}-${month}-${day}`;
  }
  
   formatTimestamp(timestamp: number): string {
      const milliseconds = timestamp * 1000;
      const date = new Date(milliseconds);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Los_Angeles' 
      };
      const formattedDate = date.toLocaleString('en-US', options)
                            .replace(/,/g, '') 
                            .replace(/\//g, '-'); 
      return formattedDate || 'Invalid Date';
    }
    convertUnixEpochToPST(unixEpochTime: number): string {
      const milliseconds = unixEpochTime * 1000;
      const date = new Date(milliseconds);
      const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'America/Los_Angeles' 
      });
      const parts = formatter.formatToParts(date);
      const formattedDate = `${parts[4].value}-${parts[0].value}-${parts[2].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;
      return formattedDate;
  }
    
    formatCurrentDate(): string {
      const currentDate = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Los_Angeles' 
      };
      return currentDate.toLocaleString('en-US', options)
        .replace(/\//g, '-'); 
    }
    
    currentStatusOfMarketOpen(): boolean {
      const currentTime = Math.floor(new Date().getTime() / 1000);
      const difference = currentTime - this.quote.t;
      return difference <= 200; 
    }
    
    areKeysNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  openBuyModal(content: any): void {
    this.resetQuantity();
    this.getCashBalance();
    this.modalService.open(content, { ariaLabelledBy: 'buy-modal' }).result.then(() => {
        console.log('Buy modal closed');
    }, () => {
        console.log('Buy modal dismissed');
    });
}
openSellModal(content: any) {
  this.resetQuantity();
  this.getCashBalance();
  this.modalService.open(content, { ariaLabelledBy: 'sellModal' }).result.then(() => {
    console.log('Sell modal closed');
  }, () => {
    console.log('Sell modal dismissed');
  });
  this.sell();
}


getCashBalance(): void {
    this.buyService.getCashBalance()
        .subscribe(balance => {
            this.cashBalance = balance;
        });
}
getTickerInfo(ticker: string)
{
  const tickerName=ticker;
  this.http.get<{ exists: boolean }>(`${this.backendUrl}/getTickerInfo?ticker=${tickerName}`)                                                                       
  .subscribe({
    next: (response) => {
      console.log('Response from backend:', response);
      if (response.exists) {
        this.isStarActive = true;
      } else {
        this.isStarActive = false;
      }
      
    },
    error: (error) => {
      console.error('Error fetching quantity details:', error);
    }
  });
}


calculateTotal(): void {
  const calculatedTotal = this.quantity * parseFloat(this.quote.c);
  this.total = parseFloat(calculatedTotal.toFixed(2));
   
    this.buyButtonDisabled = this.quantity < 1 || this.total > this.cashBalance || this.quantity % 1 !== 0 ;
}

updateTotal() :void{
  const calculatedTotal = this.quantity * parseFloat(this.quote.c);
  this.total = parseFloat(calculatedTotal.toFixed(2));
  this.sellButtonDisabled = this.quantity < 1 || this.quantity > this.totalQuantityPurchased || this.quantity % 1 !== 0;
}
buystock(): void {

  try {
    
    const remainingA = this.cashBalance - this.total;
    const remainingAmount = parseFloat(remainingA.toFixed(2));
    this.http.get<any>(`${this.backendUrl}/buystock?remainingAmount=${remainingAmount}`)
      .subscribe(response => {
        console.log('Backend response:', response);
      }, error => {
        console.error('Error:', error);
      });
      this.modalService.dismissAll();
      this.showNotification = true;
      this.notificationMessage = `${this.profile.ticker} bought successfully.`;

  setTimeout(() => {
    this.showNotification = false;
  }, 2000);
  } catch (error) {
    console.error('Error:', error);
  }
  this.portfolioDetails();
  this.isSell = true;

}
sellstock(): void
{

try {  
  const remainingA = parseFloat(this.cashBalance.toString()) + parseFloat(this.total.toString());
  const remainingAmount = parseFloat(remainingA.toFixed(2));
    this.http.get<any>(`${this.backendUrl}/buystock?remainingAmount=${remainingAmount}`)
      .subscribe(response => {
        console.log('Backend response:', response); 
      }, error => {
        console.error('Error:', error);
      });
      this.modalService.dismissAll();
      this.showsellNotification = true;
      this.sellnotificationMessage = `${this.profile.ticker} sold successfully.`;
      setTimeout(() => {
        this.showsellNotification = false;
      }, 2000);
  } catch (error) {
    console.error('Error:', error);

  } 
  if(this.totalQuantityPurchased - this.quantity <=0 )
   {
    this.isSell = false;
   }
   this.updatingDetails();
}

portfolioDetails(): void {
  const tickerSymbol = this.profile.ticker;
  const nameSymbol = this.profile.name;
  const quantityDetails = this.quantity;
  const calculatedTotal = this.quantity * parseFloat(this.quote.c);
  const Total = parseFloat(calculatedTotal.toFixed(2));
  const AverageCost = Total/this.quantity;
  this.http.get<any>('${this.backendUrl}/portfolioDetails', {
    params: {
      tickerSymbol: tickerSymbol,
      nameSymbol: nameSymbol,
      quantityDetails: quantityDetails.toString(),
      Total: Total.toString(),
      AverageCost: AverageCost.toString()
    }
  }).subscribe(response => {
    
    console.log('Backend response:', response);
  }, error => {
    console.error('Error:', error);
  });

}

updatingDetails(): void {
  const tickerSymbol = this.profile.ticker;
  const nameSymbol = this.profile.name;
  const quantityDetails = this.quantity;
  const calculatedTotal = this.quantity * parseFloat(this.quote.c);
  const Total = parseFloat(calculatedTotal.toFixed(2));
  const AverageCost = Total/this.quantity;
  this.http.get<any>('${this.backendUrl}/updatingDetails', {
    params: {
      tickerSymbol: tickerSymbol,
      nameSymbol: nameSymbol,
      quantityDetails: quantityDetails.toString(),
      Total: Total.toString(),
      AverageCost: AverageCost.toString()
    }
  }).subscribe(response => {
    
    console.log('Backend response:', response);
  }, error => {
    console.error('Error:', error);
  });

} 

resetQuantity() {
  this.quantity = 0;
  this.total = 0; 
}
sell()
{
  console.log('SELL clicked');
  this.http.get<any>(`${this.backendUrl}/getQuantity?ticker=${this.profile.ticker}`)                                                                       
    .subscribe({
      next: (response) => {
        this.totalQuantityPurchased = response.quantityDetails;
        console.log('Total Quantity Purchased sent from backend:', this.totalQuantityPurchased);
      },
      error: (error) => {
        console.error('Error fetching quantity details:', error);
      }
    });

}

openPeer(company: string, event: Event): void {
  event.preventDefault(); 

this.router.navigate(['/search', company]);  
}

openModal(content: any, news: any) {
  this.selectedNews = news; 
  this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
   
  }, (reason) => {
    console.log(reason);    
  });

  }
  encodeURIComponent(uriComponent: string): string {
    return encodeURIComponent(uriComponent);
  }
  GetWords(text: string, maxWords: number): string {
    const words = text.split(' ');
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
  }

  
    async getAIInsights() {
      this.aiResponse = '' as unknown as SafeHtml;
      if (!this.userQuery.trim()) return; 
      
      this.isChatLoading = true;
      
      try {
        const response = await axios.post(`${this.backendUrl}/ask-ai`, {question: this.userQuery});
        const answer = response.data.answer || 'No response received.';
        const markedResult = marked(answer);
        
        if (markedResult instanceof Promise) {
          const htmlString = await markedResult;
          this.aiResponse = this.sanitizer.bypassSecurityTrustHtml(htmlString);
        } else {
          this.aiResponse = this.sanitizer.bypassSecurityTrustHtml(markedResult);
        }
      } catch (error) {
        console.error('Error:', error);
        this.aiResponse = this.sanitizer.bypassSecurityTrustHtml('Failed to get a response. Please try again.');
      } finally {
        this.isChatLoading = false;
      }
    }



}
  






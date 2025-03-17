import { Component, OnInit } from '@angular/core';
import { BuyService } from '../buy.service';
import { HttpClient } from '@angular/common/http';
import { PortfolioService } from '../portfolio.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router,  NavigationEnd } from '@angular/router';
import { SearchService } from '../search.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})

export class PortfolioComponent implements OnInit  {
  documents: any[] = [];
  cashBalance: number = 0;
  isLoading: boolean = true;
  selectedDocument: any;
  quantity: number = 0;
  totalCost: number = 0;
  sellQuantity: number = 0;
  cantSell: boolean = false;
  canSellButton: boolean = false;
  showNotification: boolean = false;
  showSellNotification: boolean = false;
  notificationMessage: string = '';
  backendUrl = environment.backendUrl;
  constructor(private buyService: BuyService, private router: Router, private route: ActivatedRoute, private http: HttpClient, private portfoliodetails: PortfolioService, private modalService: NgbModal,  private searchService: SearchService) { }

  ngOnInit(): void {
    this.getCashBalance();
    this.getWatchlist();
  }

  getCashBalance(): void {
    this.buyService.getCashBalance()
      .subscribe(balance => {
        this.cashBalance = balance;
      });
  }

async getWatchlist(): Promise<void> {
  this.portfoliodetails.getWatchlist().subscribe(async documents => {
    this.documents = documents;

    for (const document of this.documents) {
      const tickerSymbol = document.tickerSymbol;
      try {
        const response = await this.http.get<any>(`${this.backendUrl}/currentTickerDetails?tickerValue=${tickerSymbol}`).toPromise();
       document.c = Math.floor(response.c * 100) / 100;
       document.AverageCost = Math.floor(document.AverageCost * 100) / 100;
      } catch (error) {
        console.error(`Error retrieving data for ${tickerSymbol}`, error);
      }
    }
    this.isLoading = false;
  });
}

navigateTicker(tickerSymbol: string): void {
  this.searchService.setLastSearchRoute('/search/' + tickerSymbol);
  this.router.navigate(['/search', tickerSymbol]);
}
openModel(document: any) {
  this.selectedDocument = document;
  this.quantity = 0;
  this.updateTotal();
}
updateTotal(): void {
  const calculatedTotal = this.quantity * parseFloat(this.selectedDocument.c);
  this.totalCost = parseFloat(calculatedTotal.toFixed(2));

}
openSellModel(document: any) {
  console.log('The document selected inside portfolio is:',document);
  this.sellQuantity = document.quantityDetails
  this.selectedDocument = document;
  this.quantity = 0;
  this.updateTotals();
}
updateTotals(): void {
  const calculatedTotal = this.quantity * parseFloat(this.selectedDocument.c);
  this.totalCost = parseFloat(calculatedTotal.toFixed(2));
  if(this.quantity > this.sellQuantity)
  {
    this.cantSell = true;
    this.canSellButton = false;
  }
  else if(this.quantity <=0)
  {
    this.cantSell = false;
    this.canSellButton = false;
  }
  else if(this.quantity % 1 !== 0)
  {
    this.cantSell = false;
    this.canSellButton = false;
  }
  else{
    this.cantSell = false;
    this.canSellButton = true;

  }
}
canBuy(): boolean {
  return this.quantity > 0 && this.totalCost <= this.cashBalance && this.totalCost > 0 && this.quantity % 1 == 0;
}
canSell(quantityNumber: number): boolean {
 return this.quantity > 0 && quantityNumber>=this.quantity ;
}


buyStocks(): void {
  try
  {
    const remainingA = this.cashBalance - this.totalCost;
    const remainingAmount = parseFloat(remainingA.toFixed(2));
    this.http.get<any>(`${this.backendUrl}/buystock?remainingAmount=${remainingAmount}`)
      .subscribe(response => {
        console.log('Backend response:', response);
      }, error => {
        console.error('Error:', error);
      });
      this.cashBalance -= this.totalCost;
      this.cashBalance = parseFloat(this.cashBalance.toFixed(2));
      const documentToUpdate = this.documents.find(doc => doc.tickerSymbol === this.selectedDocument.tickerSymbol);
        if (documentToUpdate) {
          documentToUpdate.quantityDetails = parseFloat(documentToUpdate.quantityDetails.toString()) + parseFloat(this.quantity.toString());
          documentToUpdate.Total = parseFloat(documentToUpdate.Total.toString()) + parseFloat(this.totalCost.toString()); 
          const newAvg = parseFloat(this.totalCost.toString()) / parseFloat(this.quantity.toString());
          documentToUpdate.AverageCost = (parseFloat(documentToUpdate.AverageCost.toString()) + parseFloat(newAvg.toString())) / 2;
          
        }
      this.modalService.dismissAll();
      this.showNotification = true;
  this.notificationMessage = `${this.selectedDocument.tickerSymbol} bought successfully.`;
  setTimeout(() => {
    this.showNotification = false;
  }, 1000);
  }
  catch (error) {
    console.error('Error:', error);
  }
  this.portfolioDetails();
 
}
sellStocks(): void {
  try
  {
    const remainingA = parseFloat(this.cashBalance.toString()) + parseFloat(this.totalCost.toString());
    const remainingAmount = parseFloat(remainingA.toFixed(2));
    this.http.get<any>(`${this.backendUrl}/buystock?remainingAmount=${remainingAmount}`)
      .subscribe(response => {
        console.log('Backend response:', response);
      }, error => {
        console.error('Error:', error);
      });
      this.cashBalance = parseFloat(this.cashBalance.toString()) + parseFloat(this.totalCost.toString());
      const documentToUpdate = this.documents.find(doc => doc.tickerSymbol === this.selectedDocument.tickerSymbol);
        if (documentToUpdate) {
          documentToUpdate.quantityDetails -= this.quantity;  
          if(documentToUpdate.quantityDetails <=0)
          {
            this.documents = this.documents.filter(doc => doc.tickerSymbol !== documentToUpdate.tickerSymbol);
            this.deleteTickerSymbol(documentToUpdate.tickerSymbol);
          }
          else{
            this.updateQuantity();
          }
          
          documentToUpdate.Total = parseFloat(documentToUpdate.Total.toString()) - parseFloat(this.totalCost.toString());
          const newAvg = parseFloat(this.totalCost.toString()) / parseFloat(this.quantity.toString());
          documentToUpdate.AverageCost = (parseFloat(documentToUpdate.AverageCost.toString()) + parseFloat(newAvg.toString())) / 2;
          
        }
      this.modalService.dismissAll();
      this.showSellNotification = true;
  this.notificationMessage = `${this.selectedDocument.tickerSymbol} sold successfully.`;
  setTimeout(() => {
    this.showSellNotification = false;
  }, 1000);
  }
  catch (error) {
    console.error('Error:', error);
  }
}

deleteTickerSymbol(tickerSymbol: string): void
{
  const TickerObtained = tickerSymbol;
  const url = `${this.backendUrl}/deleteTicker?tickerSymbol=${TickerObtained}`;
    this.http.get(url).subscribe({
      next: (response) => {
        console.log('Ticker deleted successfully:', response);
      },
      error: (error) => {
        console.error('Error deleting ticker:', error);
      }
    }); 

}


portfolioDetails(): void {

  const tickerSymbol = this.selectedDocument.tickerSymbol;
  const nameSymbol = this.selectedDocument.nameSymbol;
  const quantityDetails = this.quantity; 
  const calculatedTotal = this.quantity * parseFloat(this.selectedDocument.c) ;
  const Total = parseFloat(calculatedTotal.toFixed(2));
  const newAvg = parseFloat(this.totalCost.toString()) / parseFloat(this.quantity.toString());
  const AverageCost = parseFloat(newAvg.toFixed(2));
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


updateQuantity(): void {
  const tickerSymbol = this.selectedDocument.tickerSymbol;
  const nameSymbol = this.selectedDocument.nameSymbol;
  const quantityDetails = this.quantity; 
  const calculatedTotal = this.quantity * parseFloat(this.selectedDocument.c) ;
  const Total = parseFloat(calculatedTotal.toFixed(2));
  const newAvg = parseFloat(this.totalCost.toString()) / parseFloat(this.quantity.toString());
  const AverageCost = parseFloat(newAvg.toFixed(2));
  this.http.get<any>('${this.backendUrl}/updateQuantity', {
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


}



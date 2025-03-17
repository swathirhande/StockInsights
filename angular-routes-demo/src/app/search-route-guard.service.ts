/*import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SearchRouteGuardService {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const currentUrl = window.location.href;

    // Check if the current URL is /search/home or matches /search/<ticker>
    if (currentUrl.endsWith('/search/home') || currentUrl.match(/\/search\/\w+/)) {
      return true; // Allow navigation
    } else {
      // Redirect to /search/home for any other URL
      return this.router.parseUrl('/search/home');
    }
  }
}

*/



/*
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchRouteGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const url = state.url;
    if (url.startsWith('/search/')) {
      // Redirect to the search component
      return true; // Allow navigation to the search component
    } else {
      // Redirect to /search/home
      this.router.navigateByUrl('/search/home');
      return false; // Prevent navigation
    }
  }
}
*/




  




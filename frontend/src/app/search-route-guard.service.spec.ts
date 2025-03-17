import { TestBed } from '@angular/core/testing';

import { SearchRouteGuardService } from './search-route-guard.service';

describe('SearchRouteGuardService', () => {
  let service: SearchRouteGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRouteGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

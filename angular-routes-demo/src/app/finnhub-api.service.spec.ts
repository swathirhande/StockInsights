import { TestBed } from '@angular/core/testing';

import { FinnhubApiService } from './finnhub-api.service';

describe('FinnhubApiService', () => {
  let service: FinnhubApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinnhubApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingtwotabComponent } from './searchingtwotab.component';

describe('SearchingtwotabComponent', () => {
  let component: SearchingtwotabComponent;
  let fixture: ComponentFixture<SearchingtwotabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchingtwotabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchingtwotabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

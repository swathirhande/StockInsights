import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingtabComponent } from './searchingtab.component';

describe('SearchingtabComponent', () => {
  let component: SearchingtabComponent;
  let fixture: ComponentFixture<SearchingtabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchingtabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchingtabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

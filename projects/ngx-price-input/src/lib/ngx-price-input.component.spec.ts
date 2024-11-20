import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPriceInputComponent } from './ngx-price-input.component';

describe('NgxPriceInputComponent', () => {
  let component: NgxPriceInputComponent;
  let fixture: ComponentFixture<NgxPriceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPriceInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NgxPriceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

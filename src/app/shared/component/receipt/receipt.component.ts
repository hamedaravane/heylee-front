import { Component, Input, OnInit } from '@angular/core';
import { ProductImageContainerComponent } from '@shared/component/product-image-container/product-image-container.component';
import { DecimalPipe } from '@angular/common';
import { StockItemSelection } from '@inventory/entity/inventory.entity';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';

@Component({
  selector: 'receipt',
  templateUrl: './receipt.component.html',
  imports: [ProductImageContainerComponent, DecimalPipe, CurrencyComponent],
  standalone: true
})
export class ReceiptComponent {
  @Input({ required: true }) selectedProducts: StockItemSelection[] = [];
  @Input({ required: true }) totalOrderPrice = 0;
  @Input({ required: true }) shippingPrice = 0;
  @Input({ required: true }) discount = 0;
  @Input({ required: true }) customerPayment = 0;
  @Input({ required: true }) customerName = '';
  @Input({ required: true }) address = '';
  readonly today = new Date();

  formatter = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
}

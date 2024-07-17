import { Component, inject, OnInit } from '@angular/core';
import { SaleFacade } from '@sale/data-access/sale.facade';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { FormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzCheckboxModule, NzPaginationModule, AsyncPipe, NzEmptyModule, DatePipe, NzDividerModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  invoiceData$ = this.saleFacade.invoice$;
  expandOptions = [
    { label: 'مشتری‌ها', value: 'customer', checked: true },
    { label: 'محصولات', value: 'sales_item.product', checked: false },
    { label: 'آیتم‌ها', value: 'sales_item', checked: false }
  ];

  ngOnInit() {
    this.saleFacade.fetchInvoices(['customer']).then();
  }

  expandWith(value: {label: string, value: string, checked: boolean}[]): void {
    const values = value.map(item => item.value);
    this.saleFacade.fetchInvoices(values).then();
  }
}

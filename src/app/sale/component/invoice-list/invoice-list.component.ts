import {Component, inject, OnInit} from '@angular/core';
import {SaleFacade} from '@sale/data-access/sale.facade';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {FormsModule} from '@angular/forms';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzCheckboxModule, NzPaginationModule, AsyncPipe, NzEmptyModule, DatePipe, NzDividerModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  invoiceData$ = this.saleFacade.invoices$;

  ngOnInit() {
    this.saleFacade.loadInvoices().then();
  }
}

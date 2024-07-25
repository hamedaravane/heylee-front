import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {SaleFacade} from '@sale/data-access/sale.facade';
import {AsyncPipe, CurrencyPipe, DecimalPipe, NgIf} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {FormsModule} from '@angular/forms';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {PersianDatePipe} from "@sale/pipe/persian-date.pipe";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SaleInvoice} from "@sale/entity/invoice.entity";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzModalModule} from "ng-zorro-antd/modal";

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzModalModule, NzButtonModule, NzPaginationModule, AsyncPipe, NzEmptyModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule, PageContainerComponent, CardContainerComponent, PersianDatePipe, CurrencyComponent, NgIf],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  private readonly destroyRef = inject(DestroyRef);
  invoiceData: SaleInvoice[] = [];
  loadingState = false;

  ngOnInit() {
    this.saleFacade.loadInvoices().then();
    this.saleFacade.invoices$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(invoices => {
        this.invoiceData = invoices;
      });
    this.saleFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loading => {
        this.loadingState = loading;
      });
  }
}

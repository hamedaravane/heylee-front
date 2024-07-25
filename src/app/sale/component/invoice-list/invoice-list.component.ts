import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {SaleFacade} from '@sale/data-access/sale.facade';
import {AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgIf} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {FormsModule} from '@angular/forms';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {RouterLink} from '@angular/router';
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {PersianDatePipe} from "@sale/pipe/persian-date.pipe";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SaleInvoice} from "@sale/entity/invoice.entity";
import {NzCollapseModule} from "ng-zorro-antd/collapse";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzModalModule} from "ng-zorro-antd/modal";

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzDrawerModule, NzModalModule, NzButtonModule, NzPaginationModule, NzCollapseModule, AsyncPipe, NzEmptyModule, DatePipe, NzDividerModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule, RouterLink, PageContainerComponent, CardContainerComponent, PersianDatePipe, CurrencyComponent, NgIf],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  private readonly destroyRef = inject(DestroyRef);
  invoiceData: SaleInvoice[] = [];
  loadingState = false;
  moreInfo = false;

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

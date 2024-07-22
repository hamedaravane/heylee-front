import { inject, Injectable } from '@angular/core';
import { SaleInfra } from '@sale/infrastructure/sale.infra';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Subject } from 'rxjs';
import { CreateInvoice, SaleInvoice } from '@sale/entity/invoice.entity';
import { InventoryApi } from '@inventory/api/inventory.api';

@Injectable({
  providedIn: 'root'
})
export class SaleFacade {
  private readonly saleInfra = inject(SaleInfra);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly invoiceSubject = new Subject<SaleInvoice[]>();
  private readonly createInvoiceLoadingSubject = new Subject<boolean>();

  get createInvoiceLoading$() {
    return this.createInvoiceLoadingSubject.asObservable();
  }

  get availableProducts$() {
    return this.inventoryApi.availableProducts$;
  }

  get invoice$() {
    return this.invoiceSubject.asObservable();
  }

  async fetchInvoices() {
    try {
      const response = await firstValueFrom(this.saleInfra.getSaleInvoices());
      this.invoiceSubject.next(response);
    } catch (e) {
      const err = e as Error;
      console.error(err);
      this.nzMessageService.error(err.message);
    }
  }

  async createSaleInvoice(data: CreateInvoice) {
    try {
      await firstValueFrom(this.saleInfra.createSaleInvoice(data));
      this.createInvoiceLoadingSubject.next(true);
    } catch (e) {
      const err = e as Error;
      console.error(err);
      this.nzMessageService.error(err.message);
    } finally {
      this.createInvoiceLoadingSubject.next(false);
    }
  }
}

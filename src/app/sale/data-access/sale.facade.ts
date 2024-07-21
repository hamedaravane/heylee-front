import {inject, Injectable} from "@angular/core";
import {SaleInfra} from "@sale/infrastructure/sale.infra";
import {NzMessageService} from "ng-zorro-antd/message";
import {firstValueFrom, Subject} from "rxjs";
import {Invoice} from "@sale/entity/invoice.entity";
import {InventoryApi} from "@inventory/api/inventory.api";

@Injectable({
  providedIn: 'root'
})
export class SaleFacade {
  private readonly productInfra = inject(SaleInfra);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly invoiceSubject = new Subject<Invoice[]>();

  get availableProducts$() {
    return this.inventoryApi.availableProducts$;
  }

  get invoice$() {
    return this.invoiceSubject.asObservable();
  }

  async fetchInvoices() {
    try {
      const response = await firstValueFrom(this.productInfra.getSaleInvoices());
      this.invoiceSubject.next(response);
    } catch (e) {
      const err = e as Error;
      console.error(err);
      this.nzMessageService.error(err.message);
    }
  }
}

import {inject, Injectable} from '@angular/core';
import {SaleInfra} from '@sale/infrastructure/sale.infra';
import {NzMessageService} from 'ng-zorro-antd/message';
import {BehaviorSubject, firstValueFrom, Observable, Subject} from 'rxjs';
import {CreateUpdateInvoice, SaleInvoice} from '@sale/entity/invoice.entity';
import {InventoryApi} from "@inventory/api/inventory.api";
import {ServerResponseError} from "@shared/entity/server-response.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleFacade {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly saleInfra = inject(SaleInfra);
  private readonly invoicesSubject = new Subject<SaleInvoice[]>();
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$() {
    return this.loadingSubject.asObservable();
  }

  get invoices$(): Observable<SaleInvoice[]> {
    return this.invoicesSubject.asObservable();
  }

  async loadInvoices() {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.saleInfra.fetchSaleInvoices());
      this.invoicesSubject.next(response);
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createSaleInvoice(data: CreateUpdateInvoice) {
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.saleInfra.createSaleInvoice(data));
      this.nzMessageService.success('سفارش فاکتور ثبت شد.');
      this.inventoryApi.fetchAvailableProducts();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateSaleInvoice(id: number, data: CreateUpdateInvoice) {
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.saleInfra.updateSaleInvoice(id, data));
      this.nzMessageService.success('سفارش فاکتور ویرایش شد.');
      this.inventoryApi.fetchAvailableProducts();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }
}

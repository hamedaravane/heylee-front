import {inject, Injectable} from '@angular/core';
import {SaleInfra} from '@sale/infrastructure/sale.infra';
import {NzMessageService} from 'ng-zorro-antd/message';
import {BehaviorSubject, firstValueFrom, Observable, Subject} from 'rxjs';
import {CreateUpdateInvoice, SaleInvoice, SaleInvoiceDTO} from '@sale/entity/invoice.entity';
import {InventoryApi} from '@inventory/api/inventory.api';
import {IndexResponse, ServerResponseError} from '@shared/entity/server-response.entity';
import {FilterIndex} from "@shared/entity/common.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleFacade {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly saleInfra = inject(SaleInfra);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly invoiceIndexSubject = new Subject<IndexResponse<SaleInvoice>>();

  get invoiceIndex$(): Observable<IndexResponse<SaleInvoice>> {
    return this.invoiceIndexSubject.asObservable();
  }

  loading$ = this.loadingSubject.asObservable();

  async loadInvoices(pageIndex: number = 1, filters?: FilterIndex<SaleInvoiceDTO>[]) {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.saleInfra.fetchSaleInvoices(pageIndex, filters));
      this.invoiceIndexSubject.next(response);
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

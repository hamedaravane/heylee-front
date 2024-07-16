import {inject, Injectable} from '@angular/core';
import {SaleInfra} from '../infrastructure/sale.infra';
import {firstValueFrom, Subject} from 'rxjs';
import {ProductData, productDtoToProductData} from '../entity/product.entity';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Invoice, mapInvoiceDTOToEntity} from "@sale/entity/invoice.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleFacade {
  private readonly productInfra = inject(SaleInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly availableProductsSubject = new Subject<ProductData[]>();
  private readonly invoiceSubject = new Subject<Invoice>();

  get availableProducts$() {
    return this.availableProductsSubject.asObservable();
  }

  get invoice$() {
    return this.invoiceSubject.asObservable();
  }

  async getAvailableProducts() {
    try {
      const response = await firstValueFrom(this.productInfra.getAvailableProducts());
      if (response.ok) {
        this.availableProductsSubject.next(response.result.map(result => productDtoToProductData(result)));
      } else {
        this.nzMessageService.error('لیست محصولات دریافت نشد');
      }
    } catch (e) {
      const err = e as Error;
      this.nzMessageService.error(err.message);
    }
  }

  async fetchInvoices(expand: string[] = []) {
    try {
      const response = await firstValueFrom(this.productInfra.getInvoices(expand));
      if (response.ok) {
        const invoice = mapInvoiceDTOToEntity(response);
        this.invoiceSubject.next(invoice);
      } else {
        this.nzMessageService.error('لیست سفارشات دریافت نشد');
      }
    } catch (e) {
      const err = e as Error;
      this.nzMessageService.error(err.message);
    }
  }
}

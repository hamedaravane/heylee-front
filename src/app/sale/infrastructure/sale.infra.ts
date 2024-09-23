import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {CreateUpdateInvoice, SaleInvoice, SaleInvoiceDTO} from '@sale/entity/invoice.entity';
import {toCamelCase, toSnakeCase} from '@shared/entity/utility.entity';
import {FilterIndex} from '@shared/entity/common.entity';
import {BaseInfra} from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root'
})
export class SaleInfra extends BaseInfra {
  private readonly endpoint = 'sales-invoice';

  fetchSaleInvoices(pageIndex: number = 1, filters?: FilterIndex<SaleInvoiceDTO>[], sort?: string): Observable<IndexResponse<SaleInvoice>> {
    return this.fetchEntities<SaleInvoiceDTO, SaleInvoice>(
      this.endpoint,
      toCamelCase,
      pageIndex,
      filters,
      sort,
      'customer,sales_item,sales_item.product,sales_item.color,sales_item.size',
    );
  }

  createSaleInvoice(createInvoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    return this.createEntity<CreateUpdateInvoice, SaleInvoiceDTO, SaleInvoice>(
      this.endpoint,
      createInvoice,
      toCamelCase,
      toSnakeCase
    );
  }

  updateSaleInvoice(id: number, invoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    return this.updateEntity<CreateUpdateInvoice, SaleInvoiceDTO, SaleInvoice>(
      this.endpoint,
      id,
      invoice,
      toCamelCase,
      toSnakeCase
    );
  }
}

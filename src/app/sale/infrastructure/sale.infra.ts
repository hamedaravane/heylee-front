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
  fetchSaleInvoices(pageIndex: number = 1, filters?: FilterIndex<SaleInvoiceDTO>[]): Observable<IndexResponse<SaleInvoice>> {
    return this.fetchEntities<SaleInvoiceDTO, SaleInvoice>(
      'sales-invoice/index',
      toCamelCase<SaleInvoiceDTO, SaleInvoice>,
      pageIndex,
      'customer,sales_item,sales_item.product,sales_item.color,sales_item.size',
      filters,
      25,
      '-created_at'
    );
  }

  createSaleInvoice(createInvoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    return this.createEntity<CreateUpdateInvoice, SaleInvoiceDTO, SaleInvoice>(
      'sales-invoice/create',
      createInvoice,
      toCamelCase,
      toSnakeCase
    );
  }

  updateSaleInvoice(id: number, invoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    return this.updateEntity<CreateUpdateInvoice, SaleInvoiceDTO, SaleInvoice>(
      'sales-invoice',
      id,
      invoice,
      toCamelCase<SaleInvoiceDTO, SaleInvoice>,
      toSnakeCase
    );
  }
}

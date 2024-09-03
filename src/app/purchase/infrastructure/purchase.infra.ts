import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  CreatePurchaseInvoiceDTO,
  mapPurchaseInvoiceDtoToDomain,
  PurchaseInvoice,
  PurchaseInvoiceDto
} from '@purchase/entity/purchase.entity';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from '@shared/entity/common.entity';
import {BaseInfra} from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInfra extends BaseInfra {
  createPurchase(purchase: CreatePurchaseInvoiceDTO): Observable<void> {
    return this.createEntity<CreatePurchaseInvoiceDTO, void, void>(
      'purchases-invoice/create',
      purchase,
      () => {}
    );
  }

  fetchPurchaseInvoices(pageIndex: number = 1, filter?: FilterIndex<PurchaseInvoiceDto>[]): Observable<IndexResponse<PurchaseInvoice>> {
    return this.fetchEntities<PurchaseInvoiceDto, PurchaseInvoice>(
      'purchases-invoice/index',
      mapPurchaseInvoiceDtoToDomain,
      pageIndex,
      'supplier,purchases_item,purchases_item.product,purchases_item.color,purchases_item.size',
      filter,
      100,
      'created_at'
    );
  }
}

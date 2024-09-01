import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CreatePurchaseInvoiceDTO, mapPurchaseInvoiceDtoToDomain, PurchaseInvoice, PurchaseInvoiceDto} from '@purchase/entity/purchase.entity';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environment';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from '@shared/entity/common.entity';
import {ApiService} from '@shared/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInfra {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);

  createPurchase(purchase: CreatePurchaseInvoiceDTO): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/purchases-invoice/create`, purchase);
  }

  fetchPurchaseInvoices(pageIndex: number = 1, filter?: FilterIndex<PurchaseInvoiceDto>[]): Observable<IndexResponse<PurchaseInvoice>> {
    return this.apiService.fetchEntities<PurchaseInvoiceDto, PurchaseInvoice>(
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

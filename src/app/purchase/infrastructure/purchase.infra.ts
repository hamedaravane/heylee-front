import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {
  CreatePurchaseInvoiceDTO,
  mapPurchaseInvoiceDtoToDomain,
  PurchaseInvoice,
  PurchaseInvoiceDto
} from '@purchase/entity/purchase.entity';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@environment';
import {IndexResponse, ServerResponse} from "@shared/entity/server-response.entity";

@Injectable({
  providedIn: 'root'
})
export class PurchaseInfra {
  private readonly http = inject(HttpClient);

  createPurchase(purchase: CreatePurchaseInvoiceDTO): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/purchases-invoice/create`, purchase);
  }

  fetchPurchaseInvoices(): Observable<IndexResponse<PurchaseInvoice>> {
    const params = new HttpParams().set('expand', 'supplier,purchases_item,purchases_item.product,purchases_item.color,purchases_item.size');
    return this.http.get<ServerResponse<IndexResponse<PurchaseInvoiceDto>>>(`${environment.apiUrl}/purchases-invoice/index`, {params})
      .pipe(
        map(response => {
            return {
              ...response.result,
              items: response.result.items.map(item => mapPurchaseInvoiceDtoToDomain(item))
            }
          }
        )
      )
  }
}

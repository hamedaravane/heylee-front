import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import {ProductResponse} from '../entity/product.entity';
import {environment} from "@environment";
import {InvoiceDTO} from "@sale/entity/invoice.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleInfra {
  private readonly http = inject(HttpClient);

  getAvailableProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${environment.apiUrl}/inventory/available-products`)
      .pipe(
        catchError((err) => {
          throw new Error(err);
        })
      )
  }

  getInvoices(expand: string[] = []): Observable<InvoiceDTO> {
    let params = new HttpParams();
    if (expand.length > 0) {
      params = params.append('expand', expand.join(','));
    }
    return this.http.get<InvoiceDTO>(`${environment.apiUrl}/sales-invoice/index`, {params})
      .pipe(
        catchError((err) => {
          throw new Error(err);
        })
      )
  }
}

import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '@environment';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {CreateUpdateInvoice, CreateUpdateInvoiceDTO, SaleInvoice, SaleInvoiceDTO} from '@sale/entity/invoice.entity';
import {toCamelCase, toSnakeCase} from '@shared/entity/utility.entity';

@Injectable({
  providedIn: 'root'
})
export class SaleInfra {
  private readonly http = inject(HttpClient);

  fetchSaleInvoices(): Observable<SaleInvoice[]> {
    let params = new HttpParams().append('expand', 'customer,sales_item,sales_item.product,sales_item.color,sales_item.size');
    return this.http.get<ServerResponse<IndexResponse<SaleInvoiceDTO>>>(`${environment.apiUrl}/sales-invoice/index`, {params})
      .pipe(
        map(res => {
          if (res.ok) {
            return res.result.items.map((items) => dtoConvertor(items, toCamelCase<SaleInvoiceDTO, SaleInvoice>))
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  createSaleInvoice(createInvoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    const dto = toSnakeCase<CreateUpdateInvoice, CreateUpdateInvoiceDTO>(createInvoice);
    return this.http.post<ServerResponse<SaleInvoiceDTO>>(`${environment.apiUrl}/sales-invoice/create`, dto).pipe(
      map(res => {
        if (res.ok) {
          return dtoConvertor(res.result, toCamelCase<SaleInvoiceDTO, SaleInvoice>);
        } else {
          throw res.result as unknown;
        }
      }),
    )
  }

  updateSaleInvoice(id: number, invoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    const dto = toSnakeCase<CreateUpdateInvoice, CreateUpdateInvoiceDTO>(invoice);
    return this.http.post<ServerResponse<SaleInvoiceDTO>>(`${environment.apiUrl}/sales-invoice/update/${id}`, dto).pipe(
      map(res => {
        if (res.ok) {
          return dtoConvertor(res.result, toCamelCase<SaleInvoiceDTO, SaleInvoice>);
        } else {
          throw res.result as unknown;
        }
      }),
    )
  }
}

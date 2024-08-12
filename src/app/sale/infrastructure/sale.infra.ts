import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '@environment';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {
  convertCreateUpdateInvoiceToDto,
  CreateUpdateInvoice,
  SaleInvoice,
  SaleInvoiceDTO
} from '@sale/entity/invoice.entity';
import {toCamelCase} from '@shared/entity/utility.entity';
import {FilterIndex} from "@shared/entity/common.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleInfra {
  private readonly http = inject(HttpClient);

  fetchSaleInvoices(pageIndex: number = 1, filters?: FilterIndex<SaleInvoiceDTO>[]): Observable<IndexResponse<SaleInvoice>> {
    let params = new HttpParams()
      .append('expand', 'customer,sales_item,sales_item.product,sales_item.color,sales_item.size')
      .append('page', pageIndex)
      .append('per-page', 25)
      .append('sort', '-created_at')
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        params = params.append(`filter[${filter.prop}][${filter.operator}]`, `${filter.value}`);
      }
    }
    return this.http.get<ServerResponse<IndexResponse<SaleInvoiceDTO>>>(`${environment.apiUrl}/sales-invoice/index`, {params})
      .pipe(
        map(res => {
          if (res.ok) {
            return dtoConvertor(res.result, (indexResponse) => {
              return {
                ...indexResponse,
                items: indexResponse.items.map(item => dtoConvertor(item, toCamelCase<SaleInvoiceDTO, SaleInvoice>))
              };
            });
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  createSaleInvoice(createInvoice: CreateUpdateInvoice): Observable<SaleInvoice> {
    const dto = convertCreateUpdateInvoiceToDto(createInvoice);
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
    const dto = convertCreateUpdateInvoiceToDto(invoice);
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

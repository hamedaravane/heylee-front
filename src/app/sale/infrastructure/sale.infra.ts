import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '@environment';
import {dtoConvertor, ServerResponse} from "@shared/entity/server-response.entity";
import {
  CreateInvoice,
  CreateInvoiceDto,
  FullInvoice,
  FullInvoiceDto,
  Invoice,
  InvoiceDto,
  mapInvoiceDtoToInvoice
} from "@sale/entity/invoice.entity";
import {toCamelCase, toSnakeCase} from "@shared/entity/utility.entity";

@Injectable({
  providedIn: 'root'
})
export class SaleInfra {
  private readonly http = inject(HttpClient);

  getSaleInvoices(): Observable<Invoice[]> {
    let params = new HttpParams().append('expand', 'customer,sales_item,sales_item.product,sales_item.color,sales_item.size');
    return this.http.get<ServerResponse<InvoiceDto[]>>(`${environment.apiUrl}/sales-invoice/index`, {params})
      .pipe(
        map(res => {
          if (res.ok) {
            return res.result.map(dto => dtoConvertor(dto, mapInvoiceDtoToInvoice))
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  createSaleInvoice(createInvoice: CreateInvoice): Observable<FullInvoice> {
    const dto = toSnakeCase<CreateInvoice, CreateInvoiceDto>(createInvoice);
    return this.http.post<ServerResponse<FullInvoiceDto>>(`${environment.apiUrl}/sales-invoice/create`, {dto}).pipe(
      map(res => {
        if (res.ok) {
          return dtoConvertor(res.result, toCamelCase<FullInvoiceDto, FullInvoice>);
        } else {
          throw res.result as unknown;
        }
      }),
    )
  }

  updateSaleInvoice(id: number, invoice: CreateInvoice): Observable<FullInvoice> {
    const dto = toSnakeCase<CreateInvoice, CreateInvoiceDto>(invoice);
    return this.http.post<ServerResponse<FullInvoiceDto>>(`${environment.apiUrl}/sales-invoice/update/${id}`, {dto}).pipe(
      map(res => {
        if (res.ok) {
          return dtoConvertor(res.result, toCamelCase<FullInvoiceDto, FullInvoice>);
        } else {
          throw res.result as unknown;
        }
      }),
    )
  }
}

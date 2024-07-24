import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environment';
import {CreateSupplierDto, mapSupplierDtoToSupplier, Supplier, SupplierDto} from '../entity/supplier.entity';
import {map, Observable} from 'rxjs';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {toSnakeCase} from '@shared/entity/utility.entity';

@Injectable({
  providedIn: 'root',
})
export class SupplierInfra {
  private readonly http = inject(HttpClient);

  createSupplier(supplier: CreateSupplierDto): Observable<Supplier> {
    const dto: CreateSupplierDto = toSnakeCase(supplier);
    return this.http.post<ServerResponse<SupplierDto>>(`${environment.apiUrl}/supplier/create`, dto)
      .pipe(
        map<ServerResponse<SupplierDto>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDto, Supplier>(res.result, mapSupplierDtoToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  editSupplier(id: number, supplier: CreateSupplierDto): Observable<Supplier> {
    const dto: CreateSupplierDto = toSnakeCase(supplier);
    return this.http.post<ServerResponse<SupplierDto>>(`${environment.apiUrl}/supplier/update/${id}`, dto)
      .pipe(
        map<ServerResponse<SupplierDto>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDto, Supplier>(res.result, mapSupplierDtoToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  fetchSuppliers(): Observable<IndexResponse<Supplier>> {
    return this.http.get<ServerResponse<IndexResponse<SupplierDto>>>(`${environment.apiUrl}/supplier/index`)
      .pipe(
        map((res) => {
          if (res.ok) {
            return dtoConvertor<IndexResponse<SupplierDto>, IndexResponse<Supplier>>(res.result, (indexResponse) => {
              return {
                ...indexResponse,
                items: indexResponse.items.map(mapSupplierDtoToSupplier)
              }
            });
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  deleteSupplier(id: number): Observable<Supplier> {
    return this.http.delete<ServerResponse<SupplierDto>>(`${environment.apiUrl}/supplier/delete/${id}`)
      .pipe(
        map<ServerResponse<SupplierDto>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDto, Supplier>(res.result, mapSupplierDtoToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }
}

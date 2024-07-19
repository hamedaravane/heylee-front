import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environment";
import {mapSupplierDTOToSupplier, Supplier, SupplierDTO} from "../entity/supplier.entity";
import {map, Observable} from "rxjs";
import {dtoConvertor, ServerResponse} from "@shared/entity/server-response.entity";

@Injectable({
  providedIn: 'root',
})
export class SupplierInfra {
  private readonly http = inject(HttpClient);

  createSupplier(supplierDTO: SupplierDTO): Observable<Supplier> {
    return this.http.post<ServerResponse<SupplierDTO>>(`${environment.apiUrl}/supplier/create`, supplierDTO)
      .pipe(
        map<ServerResponse<SupplierDTO>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDTO, Supplier>(res.result, mapSupplierDTOToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  editSupplier(id: number, supplierDTO: SupplierDTO): Observable<Supplier> {
    return this.http.post<ServerResponse<SupplierDTO>>(`${environment.apiUrl}/supplier/update/${id}`, supplierDTO)
      .pipe(
        map<ServerResponse<SupplierDTO>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDTO, Supplier>(res.result, mapSupplierDTOToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  getAllSupplier() {}

  deleteSupplier(id: number): Observable<Supplier> {
    return this.http.delete<ServerResponse<SupplierDTO>>(`${environment.apiUrl}/supplier/delete/${id}`)
      .pipe(
        map<ServerResponse<SupplierDTO>, Supplier>((res) => {
          if (res.ok) {
            return dtoConvertor<SupplierDTO, Supplier>(res.result, mapSupplierDTOToSupplier);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }
}

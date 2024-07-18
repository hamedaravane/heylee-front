import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environment";
import {mapSupplierDTOToSupplier, Supplier, SupplierDTO} from "../entity/supplier.entity";
import {catchError, map, Observable, throwError} from "rxjs";
import {ServerResponse} from "@shared/entity/server-response.entity";

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
            return mapSupplierDTOToSupplier(res.result);
          } else {
            throw new Error('Error creating supplier');
          }
        }),
        catchError((err) => throwError(() => err))
      )
  }
}

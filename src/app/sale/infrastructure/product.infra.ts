import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { ProductResponse } from '../entity/product.entity';
import {environment} from "@environment";

@Injectable({
  providedIn: 'root'
})
export class ProductInfra {
  private readonly http = inject(HttpClient);

  getAvailableProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${environment.apiUrl}/inventory/available-products`)
      .pipe(
        catchError((err) => {
          throw new Error(err);
        })
      )
  }
}

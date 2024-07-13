import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { ProductResponse } from '../entity/product.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductInfra {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly http = inject(HttpClient);

  getAvailableProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/inventory/available-products`)
      .pipe(
        catchError((err) => {
          throw new Error(err);
        })
      )
  }
}

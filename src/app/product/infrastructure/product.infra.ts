import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../entity/product.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductInfra {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';
  getProductByCode(code: string) {
    return this.http.get<Product>(`${this.baseUrl}/api/product/${code}`);
  }
}

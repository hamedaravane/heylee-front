import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  mapProductDtoToProduct,
  mapProductToDto,
  Product,
  ProductDto
} from '../entity/product.entity';
import { map, Observable } from 'rxjs';
import { dtoConvertor, IndexResponse, ServerResponse } from '@shared/entity/server-response.entity';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class ProductInfra {
  private readonly http = inject(HttpClient);

  createProduct(product: Product): Observable<Product> {
    const dto = mapProductToDto(product);
    return this.http.post<ServerResponse<ProductDto>>(`${environment.apiUrl}/product/create`, dto)
      .pipe(
        map<ServerResponse<ProductDto>, Product>((res) => {
          if (res.ok) {
            return dtoConvertor<ProductDto, Product>(res.result, mapProductDtoToProduct);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  editProduct(id: number, product: Product): Observable<Product> {
    const dto = mapProductToDto(product);
    return this.http.post<ServerResponse<ProductDto>>(`${environment.apiUrl}/product/update/${id}`, dto)
      .pipe(
        map<ServerResponse<ProductDto>, Product>((res) => {
          if (res.ok) {
            return dtoConvertor<ProductDto, Product>(res.result, mapProductDtoToProduct);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  fetchProducts(): Observable<IndexResponse<Product>> {
    return this.http.get<ServerResponse<IndexResponse<ProductDto>>>(`${environment.apiUrl}/product/index`)
      .pipe(
        map((res) => {
          if (res.ok) {
            return dtoConvertor<IndexResponse<ProductDto>, IndexResponse<Product>>(res.result, (indexResponse) => {
              return {
                ...indexResponse,
                items: indexResponse.items.map(mapProductDtoToProduct)
              }
            });
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<ServerResponse<ProductDto>>(`${environment.apiUrl}/product/delete/${id}`)
      .pipe(
        map<ServerResponse<ProductDto>, Product>((res) => {
          if (res.ok) {
            return dtoConvertor<ProductDto, Product>(res.result, mapProductDtoToProduct);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }
}

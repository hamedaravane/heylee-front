import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {mapProductDtoToProduct, Product, ProductDto} from '../entity/product.entity';
import {firstValueFrom, map, Observable} from 'rxjs';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {environment} from '@environment';
import {IdLabel} from '@shared/entity/common.entity';
import {ApiService} from '@shared/service/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductInfra {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);

  get sizes$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/size.json'));
  }

  get colors$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/color.json'));
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<ServerResponse<ProductDto>>(`${environment.apiUrl}/product/create`, formData)
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

  editProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.post<ServerResponse<ProductDto>>(`${environment.apiUrl}/product/update/${id}`, formData)
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

  fetchProducts(pageIndex: number = 1): Observable<IndexResponse<Product>> {
    return this.apiService.fetchEntities<ProductDto, Product>(
      'product/index',
      mapProductDtoToProduct,
      pageIndex
    );
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

import {Injectable} from '@angular/core';
import {mapProductDtoToProduct, Product, ProductDto} from '../entity/product.entity';
import {firstValueFrom, Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {IdLabel} from '@shared/entity/common.entity';
import {BaseInfra} from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root',
})
export class ProductInfra extends BaseInfra {
  private readonly endpoint = 'product';

  get sizes$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/size.json'));
  }

  get colors$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/color.json'));
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.createEntity<void, ProductDto, Product>(this.endpoint, formData, mapProductDtoToProduct)
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.updateEntity<FormData, ProductDto, Product>(
      this.endpoint,
      id,
      formData,
      mapProductDtoToProduct
    );
  }

  fetchProducts(pageIndex: number = 1, perPage: number = 100, sort: string = '-created_at'): Observable<IndexResponse<Product>> {
    return this.fetchEntities<ProductDto, Product>(
      this.endpoint,
      mapProductDtoToProduct,
      pageIndex,
      undefined,
      undefined,
      perPage,
      sort
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.deleteEntity<ProductDto>(
      this.endpoint,
      id,
    );
  }
}

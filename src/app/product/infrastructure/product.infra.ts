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
  get sizes$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/size.json'));
  }

  get colors$(): Promise<IdLabel[]> {
    return firstValueFrom(this.http.get<IdLabel[]>('/json/color.json'));
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.createEntity<void, ProductDto, Product>('product/create', formData, mapProductDtoToProduct)
  }

  editProduct(id: number, formData: FormData): Observable<Product> {
    return this.updateEntity<FormData, ProductDto, Product>(
      'product',
      id,
      formData,
      mapProductDtoToProduct
    );
  }

  fetchProducts(pageIndex: number = 1): Observable<IndexResponse<Product>> {
    return this.fetchEntities<ProductDto, Product>(
      'product/index',
      mapProductDtoToProduct,
      pageIndex
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.deleteEntity<ProductDto>(
      'product',
      id,
    );
  }
}

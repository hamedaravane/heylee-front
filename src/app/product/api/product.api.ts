import {inject, Injectable} from '@angular/core';
import {ProductFacade} from '@product/data-access/product.facade';
import {Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {Product} from '@product/entity/product.entity';
import {IdLabel} from '@shared/entity/common.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductApi {
  private readonly productFacade = inject(ProductFacade);
  isFetched = false;

  get product$(): Observable<Product> {
    return this.productFacade.product$;
  }

  get productsIndex$(): Observable<IndexResponse<Product>> {
    if (!this.isFetched) {
      this.productFacade.loadProducts().then(() => {
        this.isFetched = true;
      })
    }
    return this.productFacade.productsIndex$;
  }

  get sizes$(): Promise<IdLabel[]> {
    return this.productFacade.sizes$;
  }

  get colors$(): Promise<IdLabel[]> {
    return this.productFacade.colors$;
  }

  createProduct(formData: FormData): Promise<void> {
    return this.productFacade.createProduct(formData);
  }

  createProduct$(formData: FormData): Observable<Product> {
    return this.productFacade.createProduct$(formData);
  }

  batchCreateProducts(formsData: FormData[]): void {
    formsData.forEach(formData => {
      this.createProduct(formData).then(() => setTimeout(() => {}, 5000));
    })
  }
}

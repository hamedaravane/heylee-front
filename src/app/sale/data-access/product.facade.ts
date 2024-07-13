import { inject, Injectable } from '@angular/core';
import { ProductInfra } from '../infrastructure/product.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { ProductData, productDtoToProductData } from '../entity/product.entity';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade {
  private readonly productInfra = inject(ProductInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly availableProductsSubject = new Subject<ProductData[]>();

  get availableProducts$() {
    return this.availableProductsSubject.asObservable();
  }

  async getAvailableProducts() {
    try {
      const response = await firstValueFrom(this.productInfra.getAvailableProducts());
      if (response.ok) {
        this.availableProductsSubject.next(response.result.map(result => productDtoToProductData(result)));
      } else {
        this.nzMessageService.error('لیست محصولات دریافت نشد');
      }
    } catch (e) {
      const err = e as Error;
      this.nzMessageService.error(err.message);
    }
  }
}
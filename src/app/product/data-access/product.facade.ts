import { inject, Injectable } from '@angular/core';
import { Product } from '../entity/product.entity';
import { ProductInfra } from '../infrastructure/product.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade {
  private readonly productInfra = inject(ProductInfra);
  private readonly productSubject = new Subject<Product>();
  private readonly nzMessageService = inject(NzMessageService);
  get product$() {
    return this.productSubject.asObservable();
  }
  private readonly productLoadingSubject = new Subject<boolean>();
  get productLoading$() {
    return this.productLoadingSubject.asObservable();
  }
  private readonly cartArray = new Array<Product>();
  private readonly cartSubject = new Subject<Product[]>();
  get cart$() {
    return this.cartSubject.asObservable();
  }

  async getProductByCode(code: string): Promise<void> {
    this.productLoadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.productInfra.getProductByCode(code));
      console.log(response);
      if (response) {
        this.productSubject.next(response);
      }
    } catch (e) {
      console.error(e);
      const error = e as Error;
      throw error.message;
    } finally {
      this.productLoadingSubject.next(false);
    }
  }

  addToCart(product: Product) {
    this.cartArray.push(product);
    this.cartSubject.next(this.cartArray);
    this.nzMessageService.success('کالا به سبد خرید اضافه شد');
  }
}

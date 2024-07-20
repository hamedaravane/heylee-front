import { inject, Injectable } from '@angular/core';
import { ProductInfra } from '../infrastructure/product.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { Product } from '../entity/product.entity';
import { IndexResponse, ServerError } from '@shared/entity/server-response.entity';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade {
  private readonly productInfra = inject(ProductInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly productSubject = new Subject<Product>();
  private readonly productsIndexSubject = new Subject<IndexResponse<Product>>();

  get product$() {
    return this.productSubject.asObservable()
  };

  get productsIndex$() {
    return this.productsIndexSubject.asObservable()
  };

  async loadProducts() {
    try {
      const response = await firstValueFrom(this.productInfra.fetchProducts());
      this.productsIndexSubject.next(response);
    } catch (error) {
      console.error('Error in ProductFacade loadProducts:', error);
      const err = error as ServerError;
      this.nzMessageService.error(err.error.result.message);
    }
  }

  async createProduct(formData: FormData): Promise<void> {
    try {
      const newProduct = await firstValueFrom(this.productInfra.createProduct(formData));
      this.nzMessageService.success('محصول با موفقیت اضافه شد');
      this.productSubject.next(newProduct);
    } catch (error) {
      console.error('Error in ProductFacade createProduct:', error);
      const err = error as ServerError;
      this.nzMessageService.error(err.error.result.message);
    }
  }

  async editProduct(id: number, product: Product) {
    try {
      const response = await firstValueFrom(this.productInfra.editProduct(id, product));
      this.nzMessageService.success('محصول با موفقیت اصلاح شد');
      this.productSubject.next(response);
    } catch (error) {
      console.error('Error in ProductFacade editProduct:', error);
      const err = error as ServerError;
      this.nzMessageService.error(err.error.result.message);
    }
  }

  async deleteProduct(id: number) {
    try {
      await firstValueFrom(this.productInfra.deleteProduct(id));
      this.nzMessageService.success('محصول با موفقیت حذف شد');
    } catch (error) {
      console.error('Error in ProductFacade deleteProduct:', error);
      const err = error as ServerError;
      this.nzMessageService.error(err.error.result.message);
    }
  }
}
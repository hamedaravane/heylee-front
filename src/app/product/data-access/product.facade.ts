import {inject, Injectable} from '@angular/core';
import {ProductInfra} from '../infrastructure/product.infra';
import {BehaviorSubject, filter, firstValueFrom, Subject} from 'rxjs';
import {Product} from '../entity/product.entity';
import {IndexResponse, ServerResponseError} from '@shared/entity/server-response.entity';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade {
  private readonly productInfra = inject(ProductInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly productSubject = new Subject<Product>();
  private readonly productsIndexSubject = new BehaviorSubject<IndexResponse<Product> | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$() {
    return this.loadingSubject.asObservable()
  }

  get product$() {
    return this.productSubject.asObservable()
  }

  get productsIndex$() {
    return this.productsIndexSubject.asObservable().pipe(filter(Boolean))
  }

  async loadProducts() {
    this.loadingSubject.next(true)
    try {
      const response = await firstValueFrom(this.productInfra.fetchProducts());
      this.productsIndexSubject.next(response);
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createProduct(formData: FormData): Promise<void> {
    this.loadingSubject.next(true)
    try {
      const newProduct = await firstValueFrom(this.productInfra.createProduct(formData));
      this.nzMessageService.success('محصول با موفقیت اضافه شد');
      this.productSubject.next(newProduct);
      await this.loadProducts();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async editProduct(id: number, formData: FormData) {
    this.loadingSubject.next(true)
    try {
      const response = await firstValueFrom(this.productInfra.editProduct(id, formData));
      this.nzMessageService.success('محصول با موفقیت اصلاح شد');
      this.productSubject.next(response);
      await this.loadProducts();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteProduct(id: number) {
    this.loadingSubject.next(true)
    try {
      const response = await firstValueFrom(this.productInfra.deleteProduct(id));
      this.productSubject.next(response);
      await this.loadProducts();
      this.nzMessageService.success('محصول با موفقیت حذف شد');
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }
}

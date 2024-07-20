import { inject, Injectable } from '@angular/core';
import { ProductInfra } from '../infrastructure/product.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { Product } from '../entity/product.entity';
import { IndexResponse } from '@shared/entity/server-response.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade {
  private readonly productInfra = inject(ProductInfra);
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
    }
  }

  async createProduct(product: Product): Promise<void> {
    try {
      const newProduct = await firstValueFrom(this.productInfra.createProduct(product));
      this.productSubject.next(newProduct);
    } catch (error) {
      console.error('Error in ProductFacade createProduct:', error);
    }
  }

  async editProduct(id: number, product: Product) {
    try {
      const response = await firstValueFrom(this.productInfra.editProduct(id, product));
      this.productSubject.next(response);
    } catch (error) {
      console.error('Error in ProductFacade editProduct:', error);
    }
  }

  async deleteProduct(id: number) {
    try {
      await firstValueFrom(this.productInfra.deleteProduct(id));
    } catch (error) {
      console.error('Error in ProductFacade deleteProduct:', error);
    }
  }
}
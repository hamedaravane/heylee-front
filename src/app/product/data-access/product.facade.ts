import {inject, Injectable} from '@angular/core';
import {ProductInfra} from '../infrastructure/product.infra';
import {BehaviorSubject, filter, firstValueFrom, Observable, Subject} from 'rxjs';
import {Product} from '../entity/product.entity';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {IdLabel} from '@shared/entity/common.entity';
import {BaseFacade} from '@shared/service/base.facade';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade extends BaseFacade {
  private readonly productInfra = inject(ProductInfra);
  private readonly productSubject = new Subject<Product>();
  private readonly productsIndexSubject = new BehaviorSubject<IndexResponse<Product> | null>(null);

  get product$() {
    return this.productSubject.asObservable()
  }

  get productsIndex$() {
    return this.productsIndexSubject.asObservable().pipe(filter(Boolean))
  }

  async loadProducts(pageIndex: number = 1) {
    await this.loadEntity(
      this.productsIndexSubject,
      () => firstValueFrom(this.productInfra.fetchProducts(pageIndex)),
      undefined,
      true
    )
  }

  async createProduct(formData: FormData): Promise<void> {
    await this.loadEntity(
      this.productSubject,
      () => firstValueFrom(this.productInfra.createProduct(formData)),
      () => this.loadProducts()
    )
  }

  createProduct$(formData: FormData): Observable<Product> {
    return this.productInfra.createProduct(formData);
  }

  async editProduct(id: number, formData: FormData) {
    await this.loadEntity(
      this.productSubject,
      () => firstValueFrom(this.productInfra.updateProduct(id, formData)),
      () => this.loadProducts()
    )
  }

  async deleteProduct(id: number) {
    await this.deleteEntity(
      () => firstValueFrom(this.productInfra.deleteProduct(id)),
      () => this.loadProducts()
    );
  }

  get sizes$(): Promise<IdLabel[]> {
    return this.productInfra.sizes$;
  }

  get colors$(): Promise<IdLabel[]> {
    return this.productInfra.colors$;
  }
}

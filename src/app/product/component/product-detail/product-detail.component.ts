import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ActivatedRoute } from '@angular/router';
import { ProductFacade } from '../../data-access/product.facade';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { Product } from '../../entity/product.entity';

@Component({
  selector: 'product-detail-id',
  imports: [
    NgOptimizedImage,
    NzImageModule,
    NzEmptyModule,
    NzSkeletonModule,
    NzSpaceModule,
    NzButtonModule,
    NzRadioModule,
    AsyncPipe,
    DecimalPipe
  ],
  templateUrl: './product-detail.component.html',
  standalone: true
})
export class ProductDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productFacade = inject(ProductFacade);
  productCode = this.activatedRoute.snapshot.params['code'];
  productDetail$ = this.productFacade.product$;
  productLoading$ = this.productFacade.productLoading$;
  ngOnInit() {
    this.productFacade.getProductByCode(this.productCode).then();
  }

  addToCart(product: Product) {
    this.productFacade.addToCart(product);
  }
}
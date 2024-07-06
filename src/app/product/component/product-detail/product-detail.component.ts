import { Component, inject, OnInit } from '@angular/core';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ActivatedRoute } from '@angular/router';
import { ProductFacade } from '../../data-access/product.facade';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { Product } from '../../entity/product.entity';
import {NzFormModule} from "ng-zorro-antd/form";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {OrderFacade} from "../../../order/data-access/order.facade";
import {Order} from "../../../order/entity/order.entity";

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
    NzFormModule,
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './product-detail.component.html',
  standalone: true
})
export class ProductDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productFacade = inject(ProductFacade);
  private readonly orderFacade = inject(OrderFacade);
  productCode = this.activatedRoute.snapshot.params['code'];
  productDetail$ = this.productFacade.product$;
  productLoading$ = this.productFacade.productLoading$;
  productFormGroup = new FormGroup({
    color: new FormControl('', [Validators.required]),
    size: new FormControl('', [Validators.required]),
  })
  colorControl = this.productFormGroup.get('color') as AbstractControl<string>;
  sizeControl = this.productFormGroup.get('size') as AbstractControl<string>;

  ngOnInit() {
    this.productFacade.getProductByCode(this.productCode).then();
  }

  addToCart(product: Product) {
    const order = {
      productCode: product.code,
      imageSrc: product.imageSrc,
      code: product.code,
      name: product.name,
      price: product.price,
      colorCode: this.colorControl.value,
      size: this.sizeControl.value,
      quantity: 1
    } as Order;
    this.orderFacade.setNewOrderToCart(order);
  }
}

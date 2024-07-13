import {Component, inject, OnInit, signal} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BidiModule } from '@angular/cdk/bidi';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ProductFacade } from '../../data-access/product.facade';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ProductData } from '../../entity/product.entity';
import {ProductFilterPipe} from "../../pipe/product-filter.pipe";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, ReactiveFormsModule, NzCollapseModule, NzFormModule, NzInputModule, BidiModule, NzDividerModule, AsyncPipe, FormsModule, NgOptimizedImage, DecimalPipe, ProductFilterPipe, NgTemplateOutlet],
  standalone: true,
  templateUrl: './sale-invoice.component.html',
})
export class SaleInvoiceComponent implements OnInit {
  private readonly productFacade = inject(ProductFacade);
  availableProducts$ = this.productFacade.availableProducts$;
  searchText = '';
  availableProducts = signal<ProductData[]>([]);
  selectedProducts: ProductData[] = [];

  customerForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    fullName: new FormControl('', [Validators.required, Validators.pattern('^[\u0600-\u06FF\s]+$')]),
    phone: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required, Validators.pattern('^[\u0600-\u06FF\s]+$')]),
    address: new FormControl('', [Validators.required, Validators.pattern('^[\u0600-\u06FF\s]+$')]),
    instagram: new FormControl('', [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl('', [Validators.minLength(5), Validators.maxLength(32)]),
    refNumber: new FormControl('', [Validators.required]),
    discount: new FormControl<number>(0, [Validators.required]),
    items: new FormControl<ProductData[]>([], [Validators.minLength(1)])
  })

  itemsControl = this.customerForm.get('items');

  ngOnInit() {
    this.productFacade.getAvailableProducts().then();
    firstValueFrom(this.availableProducts$).then(products => {
      this.availableProducts.set(products);
    });
  }

  addProductToOrder(product: ProductData) {
    this.selectedProducts.push(product);
    // TODO: remove from available products
    const indexToRemove = this.availableProducts().indexOf(product);
    const availableProductsClone = this.availableProducts();
    availableProductsClone.splice(indexToRemove, 1);
    this.availableProducts.set(availableProductsClone);
    // add to selected products
    this.itemsControl?.setValue(this.selectedProducts);
  }

  removeSelectedProduct(product: ProductData) {
    const indexToRemove = this.selectedProducts.indexOf(product);
    this.selectedProducts.splice(indexToRemove, 1);
    const availableProductsClone = this.availableProducts();
    availableProductsClone.push(product);
    this.availableProducts.set(availableProductsClone);
    this.itemsControl?.setValue(this.selectedProducts);
  }

  submitOrderForm() {
    console.log(this.customerForm.value);
  }
}

import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SaleFacade} from '../../data-access/sale.facade';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {ProductFilterPipe} from '../../pipe/product-filter.pipe';
import {firstValueFrom} from 'rxjs';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {StockItem} from "@inventory/entity/inventory.entity";

@Component({
  selector: 'sale-invoice',
  imports: [
    NzButtonModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzEmptyModule,
    NzFormModule,
    NzInputModule,
    BidiModule,
    NzDividerModule,
    AsyncPipe,
    FormsModule,
    NgOptimizedImage,
    DecimalPipe,
    ProductFilterPipe,
    NgTemplateOutlet,
    CardContainerComponent,
    PageContainerComponent
  ],
  standalone: true,
  templateUrl: './sale-invoice.component.html',
})
export class SaleInvoiceComponent implements OnInit {
  private readonly productFacade = inject(SaleFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly availableProducts$ = this.productFacade.availableProducts$;
  private readonly constantPostFee = 380_000;
  searchText = '';
  availableProducts: StockItem[] = [];
  selectedProducts: StockItem[] = [];
  totalOrderPrice = signal(0);
  postFee = signal(0);
  totalOrderQuantity = signal(0);
  orderFee = signal(0);
  discount = signal(0);

  customerForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    instagram: new FormControl('', [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl('', [Validators.minLength(5), Validators.maxLength(32)]),
    refNumber: new FormControl('', Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    items: new FormControl<StockItem[]>([], Validators.minLength(1))
  })

  private readonly itemsControl = this.customerForm.get('items') as AbstractControl<StockItem[]>;
  private readonly discountControl = this.customerForm.get('discount') as AbstractControl<number>;
  private readonly cityControl = this.customerForm.get('city') as AbstractControl<string>;

  ngOnInit() {
    firstValueFrom(this.availableProducts$).then(products => {
      this.availableProducts = products;
    });

    this.cityControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((city) => {
      this.postFee.set(city === 'مشهد' ? 0 : this.constantPostFee);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.discountControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((discount) => {
      this.discount.set(discount);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.itemsControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.totalOrderQuantity.set(items.reduce((acc, curr) => acc + curr.availableQuantity, 0));
      this.totalOrderPrice.set(items.reduce((acc, curr) => acc + curr.sellingUnitPrice * curr.availableQuantity, 0));
      this.postFee.set(this.totalOrderPrice() > 7_000_000 ? 0 : this.postFee());
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    })
  }

  moveProductToOrder(product: StockItem) {
    const existingProductInSelected = this.selectedProducts.find(p => p.product.id === product.product.id);
    if (existingProductInSelected) {
      existingProductInSelected.availableQuantity++;
    } else {
      this.selectedProducts.push({ ...product, availableQuantity: 1 });
    }
    product.availableQuantity--;
    if (product.availableQuantity === 0) {
      const indexToRemove = this.availableProducts.indexOf(product);
      if (indexToRemove > -1) {
        this.availableProducts = [
          ...this.availableProducts.slice(0, indexToRemove),
          ...this.availableProducts.slice(indexToRemove + 1)
        ];
      }
    }
    this.itemsControl?.setValue(this.selectedProducts);
  }

  removeSelectedProduct(product: StockItem) {
    const selectedProduct = this.selectedProducts.find(p => p.product.id === product.product.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity--;

      if (selectedProduct.availableQuantity === 0) {
        this.selectedProducts = this.selectedProducts.filter(p => p.product.id !== product.product.id);
      }
      const availableProduct = this.availableProducts.find(p => p.product.id === product.product.id);
      if (availableProduct) {
        availableProduct.availableQuantity++;
      } else {
        this.availableProducts.push({ ...product, availableQuantity: 1 });
      }
    }
    this.itemsControl?.setValue(this.selectedProducts);
  }

  submitOrderForm() {
  }
}

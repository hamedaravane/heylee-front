import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CreatePurchaseInvoice} from '@purchase/entity/purchase.entity';
import {PurchaseFacade} from '@purchase/data-access/purchase.facade';
import {BidiModule} from '@angular/cdk/bidi';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {combineLatestWith, map, startWith} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {SupplierApi} from '@supplier/api/supplier.api';
import {ProductApi} from '@product/api/product.api';
import {NzAlertModule} from 'ng-zorro-antd/alert';

@Component({
  selector: 'purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  imports: [
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzDividerModule,
    NzEmptyModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzAlertModule,
    BidiModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    DecimalPipe,
    NgOptimizedImage,
    PageContainerComponent,
    CardContainerComponent,
    AsyncPipe
  ],
  standalone: true
})
export class PurchaseInvoiceComponent implements OnInit {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly supplierApi = inject(SupplierApi);
  private readonly productApi = inject(ProductApi);
  suppliers$ = this.supplierApi.suppliers$;
  products$ = this.productApi.productsIndex$;
  sizes$ = this.productApi.sizes$;
  colors$ = this.productApi.colors$;
  loadingState = false;
  suggestionSellPricesByPercentage = [30, 50, 60, 70, 100];

  purchaseForm = new FormGroup({
    number: new FormControl<string>('', Validators.required),
    supplierId: new FormControl<number>(0, Validators.required),
    description: new FormControl<string>('', Validators.required),
    totalPrice: new FormControl<number>({value: 0, disabled: true}, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    paidPrice: new FormControl<number>({value: 0, disabled: true}, Validators.required),
    items: this.formBuilder.array([])
  });

  totalPriceControl = this.purchaseForm.controls.totalPrice as FormControl<number>;
  paidPriceControl = this.purchaseForm.controls.paidPrice as FormControl<number>;
  discountControl = this.purchaseForm.controls.discount as FormControl<number>;

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  get isDesktop() {
    return window.innerWidth > 768;
  }

  ngOnInit() {
    this.subscribeToItemChanges();
    this.totalPriceControl.valueChanges.pipe(
      startWith(this.totalPriceControl.value),
      combineLatestWith(
        this.discountControl.valueChanges.pipe(
          startWith(this.discountControl.value)
        )
      ),
      map(([totalPrice, discount]) => {
        const paidPrice = (totalPrice || 0) - (discount || 0);
        this.paidPriceControl.setValue(paidPrice, { emitEvent: false });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
    this.purchaseFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => this.loadingState = value);
    this.addItem();
  }

  addItem(itemIndex?: number) {
    if (itemIndex !== undefined) {
      const prevItem = this.items.at(itemIndex) as FormGroup;
      this.items.push(this.formBuilder.group(prevItem.value));
      this.subscribeToItemChanges(this.items.at(this.items.length - 1) as FormGroup);
      return;
    }
    const item = this.formBuilder.group({
      productId: [null, Validators.required],
      colorId: [null, Validators.required],
      sizeId: [null, Validators.required],
      quantity: [1, Validators.required],
      purchaseUnitPrice: [0, Validators.required],
      sellingUnitPrice: [0, Validators.required]
    });

    this.items.push(item);
    this.subscribeToItemChanges(item);
  }

  private updateTotalPrice() {
    const newTotalPrice = this.items.controls.reduce((total, item) => {
      const purchaseUnitPrice = item.get('purchaseUnitPrice')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      return total + (purchaseUnitPrice * quantity);
    }, 0);

    this.totalPriceControl.setValue(newTotalPrice, { emitEvent: false });
    this.totalPriceControl.updateValueAndValidity();
  }

  private subscribeToItemChanges(item?: FormGroup) {
    const items = item ? [item] : this.items.controls;
    items.forEach(control => {
      control.get('purchaseUnitPrice')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateTotalPrice();
      });

      control.get('quantity')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateTotalPrice();
      });
    });

    this.updateTotalPrice();
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.updateTotalPrice();
  }

  async submitPurchaseForm(): Promise<void> {
    if (this.purchaseForm.invalid) {
      return;
    }
    try {
      const formValue = this.purchaseForm.getRawValue() as CreatePurchaseInvoice;
      await this.purchaseFacade.createPurchase(formValue);
    } catch (e) {
      console.error(e);
    }
  }
}

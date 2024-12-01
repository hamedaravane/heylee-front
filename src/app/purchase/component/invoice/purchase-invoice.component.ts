import { AfterContentInit, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatePurchaseInvoice, CreatePurchaseItem } from '@purchase/entity/purchase.entity';
import { PurchaseFacade } from '@purchase/data-access/purchase.facade';
import { BidiModule } from '@angular/cdk/bidi';
import { AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { SupplierApi } from '@supplier/api/supplier.api';
import { ProductApi } from '@product/api/product.api';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ProductImageContainerComponent } from '@shared/component/product-image-container/product-image-container.component';
import { ImageUploaderComponent } from '@shared/component/image-uploader/image-uploader.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { PersianDatePipe } from '@shared/pipe/persian-date.pipe';
import { BatchPurchaseComponent } from '@purchase/component/batch-purchase/batch-purchase.component';
import { NgxPriceInputComponent } from 'ngx-price-input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface ItemForms {
  uniqueId: FormControl<string | null>;
  productId: FormControl<number | null>;
  colorId: FormControl<number | null>;
  sizeId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  purchaseUnitPrice: FormControl<number | null>;
  sellingUnitPrice: FormControl<number | null>;
}

@Component({
  selector: 'purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  imports: [
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzDividerModule,
    NzIconModule,
    NzEmptyModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzAlertModule,
    BidiModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    DecimalPipe,
    NzTableModule,
    NgOptimizedImage,
    PageContainerComponent,
    CardContainerComponent,
    AsyncPipe,
    NzModalModule,
    ProductImageContainerComponent,
    ImageUploaderComponent,
    CurrencyComponent,
    PersianDatePipe,
    BatchPurchaseComponent,
    NgxPriceInputComponent,
    FormsModule
  ],
  standalone: true
})
export class PurchaseInvoiceComponent implements OnInit, AfterContentInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApi);
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly supplierApi = inject(SupplierApi);
  products$ = this.productApi.productsIndex$;
  colors$ = this.productApi.colors$;
  sizes$ = this.productApi.sizes$;
  suppliers$ = this.supplierApi.suppliers$;
  isBatchPurchaseModalVisible = signal<boolean>(false);
  loadingState = false;
  purchaseForm = new FormGroup({
    number: new FormControl<string | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    totalPrice: new FormControl<number | null>({ value: 0, disabled: true }, Validators.required),
    discount: new FormControl<number | null>(0, Validators.required),
    paidPrice: new FormControl<number | null>({ value: 0, disabled: true }, Validators.required)
  });

  purchaseItemsForm = new FormArray<FormGroup<ItemForms>>(
    [
      new FormGroup<ItemForms>({
        uniqueId: new FormControl<string>(crypto.randomUUID()),
        productId: new FormControl<number | null>(null, Validators.required),
        colorId: new FormControl<number | null>(null, Validators.required),
        sizeId: new FormControl<number | null>(null, Validators.required),
        quantity: new FormControl<number | null>(1, Validators.required),
        purchaseUnitPrice: new FormControl<number | null>(null, Validators.required),
        sellingUnitPrice: new FormControl<number | null>(null, Validators.required)
      })
    ],
    Validators.minLength(1)
  );

  private readonly searchChange$ = new BehaviorSubject('');

  ngOnInit() {
    this.purchaseFacade.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => (this.loadingState = value));

    this.searchChange$
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean), distinctUntilChanged(), debounceTime(2000))
      .subscribe(code => {
        this.productApi.loadProducts([{ prop: 'code', operator: 'like', value: code }]);
      });
  }

  ngAfterContentInit() {
    this.subscribeToPurchaseFormAndUpdatePaidPrice();
    this.subscribeToItemsAndUpdateTotalPrice();
  }

  onSearch(value: string) {
    this.searchChange$.next(value);
  }

  addItem(item?: FormGroup<ItemForms>) {
    const uniqueId = crypto.randomUUID();

    if (item) {
      const newItem = new FormGroup<ItemForms>({
        uniqueId: new FormControl<string>(uniqueId),
        productId: new FormControl<number | null>(item.controls.productId.value, Validators.required),
        colorId: new FormControl<number | null>(item.controls.colorId.value, Validators.required),
        sizeId: new FormControl<number | null>(item.controls.sizeId.value, Validators.required),
        quantity: new FormControl<number | null>(item.controls.quantity.value, Validators.required),
        purchaseUnitPrice: new FormControl<number | null>(item.controls.purchaseUnitPrice.value, Validators.required),
        sellingUnitPrice: new FormControl<number | null>(item.controls.sellingUnitPrice.value, Validators.required)
      });
      this.purchaseItemsForm.push(newItem);
      return;
    } else {
      const newItem = new FormGroup<ItemForms>({
        uniqueId: new FormControl<string>(uniqueId),
        productId: new FormControl<number | null>(null, Validators.required),
        colorId: new FormControl<number | null>(null, Validators.required),
        sizeId: new FormControl<number | null>(null, Validators.required),
        quantity: new FormControl<number | null>(1, Validators.required),
        purchaseUnitPrice: new FormControl<number | null>(null, Validators.required),
        sellingUnitPrice: new FormControl<number | null>(null, Validators.required)
      });

      this.purchaseItemsForm.push(newItem);
    }
  }

  removeItem(index: number): void {
    this.purchaseItemsForm.removeAt(index);
    this.purchaseForm.updateValueAndValidity();
  }

  async submitPurchaseForm(): Promise<void> {
    try {
      const invoiceForm = this.purchaseForm.getRawValue() as Omit<CreatePurchaseInvoice, 'items'>;
      const invoice: CreatePurchaseInvoice = {
        ...invoiceForm,
        items: this.purchaseItemsForm.getRawValue() as CreatePurchaseItem[]
      };
      await this.purchaseFacade.createPurchase(invoice);
    } catch (e) {
      console.error(e);
    }
  }

  private subscribeToPurchaseFormAndUpdatePaidPrice() {
    combineLatest([
      this.purchaseForm.controls.totalPrice.valueChanges,
      this.purchaseForm.controls.discount.valueChanges.pipe(startWith(0))
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(([totalPrice, discount]) => {
          return (totalPrice || 0) - (discount || 0);
        })
      )
      .subscribe(paidPrice => {
        this.purchaseForm.controls.paidPrice.setValue(paidPrice, {
          emitEvent: false
        });
      });
  }

  private subscribeToItemsAndUpdateTotalPrice() {
    this.purchaseItemsForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        map(items => {
          return items.reduce((acc, item) => {
            return acc + (item.purchaseUnitPrice || 0) * (item.quantity || 0);
          }, 0);
        })
      )
      .subscribe(totalPrice => {
        this.purchaseForm.controls.totalPrice.setValue(totalPrice);
        this.purchaseForm.controls.totalPrice.updateValueAndValidity();
      });
  }
}

import {AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
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
import {ProductImageContainerComponent} from '@shared/component/product-image-container/product-image-container.component';
import {ImageUploaderComponent} from '@shared/component/image-uploader/image-uploader.component';
import {NzTableModule} from 'ng-zorro-antd/table';
import {CurrencyComponent} from '@shared/component/currency-wrapper/currency.component';
import {PersianDatePipe} from '@shared/pipe/persian-date.pipe';
import {BatchPurchaseComponent} from '@purchase/component/batch-purchase/batch-purchase.component';
import {CurrencyInputComponent} from '@shared/component/currency-input/currency-input.component';

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
    NzTableModule,
    NgOptimizedImage,
    PageContainerComponent,
    CardContainerComponent,
    AsyncPipe,
    ProductImageContainerComponent,
    ImageUploaderComponent,
    CurrencyComponent,
    PersianDatePipe,
    BatchPurchaseComponent,
    CurrencyInputComponent
  ],
  standalone: true
})
export class PurchaseInvoiceComponent implements OnInit, AfterViewInit {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly supplierApi = inject(SupplierApi);
  private readonly productApi = inject(ProductApi);
  private readonly cd = inject(ChangeDetectorRef);
  suppliers$ = this.supplierApi.suppliers$;
  products$ = this.productApi.productsIndex$;
  sizes$ = this.productApi.sizes$;
  colors$ = this.productApi.colors$;
  loadingState = false;
  suggestionSellPricesByPercentage = [30, 50, 60, 70, 100];

  purchaseForm = new FormGroup<{
    number: FormControl<string | null>;
    supplierId: FormControl<number | null>;
    description: FormControl<string | null>;
    totalPrice: FormControl<number | null>;
    discount: FormControl<number | null>;
    paidPrice: FormControl<number | null>;
    items: FormArray<FormGroup<{
      productId: FormControl<number | null>;
      colorId: FormControl<number | null>;
      sizeId: FormControl<number | null>;
      quantity: FormControl<number | null>;
      purchaseUnitPrice: FormControl<number | null>;
      sellingUnitPrice: FormControl<number | null>;
    } | null>>;
  }>({
    number: new FormControl<string | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    totalPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required),
    discount: new FormControl<number | null>(null, Validators.required),
    paidPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required),
    items: this.formBuilder.array<FormGroup<{
      productId: FormControl<number | null>;
      colorId: FormControl<number | null>;
      sizeId: FormControl<number | null>;
      quantity: FormControl<number | null>;
      purchaseUnitPrice: FormControl<number | null>;
      sellingUnitPrice: FormControl<number | null>;
    } | null>>([])
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
    this.totalPriceControlChange();
    this.purchaseFacade.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.loadingState = value);
  }

  ngAfterViewInit() {
    this.addItem();
  }

  addItem(itemIndex?: number) {
    const uniqueId = crypto.randomUUID();

    if (itemIndex !== undefined) {
      const prevItem = this.items.at(itemIndex) as FormGroup;
      const newItem = this.formBuilder.group({
        ...prevItem.value,
        uniqueId: [uniqueId]
      });
      this.items.push(newItem);
      this.subscribeToItemChanges(this.items.at(this.items.length - 1) as FormGroup);
      return;
    }

    const item = this.formBuilder.group({
      uniqueId: [uniqueId],
      productId: [null, Validators.required],
      colorId: [null, Validators.required],
      sizeId: [null, Validators.required],
      quantity: [1, Validators.required],
      purchaseUnitPrice: [null, Validators.required],
      sellingUnitPrice: [null, Validators.required]
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

  private totalPriceControlChange() {
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
  }

  removeItem(index: number): void {
    console.log(this.items.at(index).value);
    this.items.removeAt(index);
    this.cd.markForCheck();
    console.log(index);
    this.updateTotalPrice();
    this.items.updateValueAndValidity()
  }

  async submitPurchaseForm(): Promise<void> {
    if (this.purchaseForm.invalid) {
      return;
    }
    try {
      const formValue = this.extractDataFromPurchaseForm(this.purchaseForm.getRawValue());
      await this.purchaseFacade.createPurchase(formValue);
    } catch (e) {
      console.error(e);
    }
  }

  private extractDataFromPurchaseForm(value: any): CreatePurchaseInvoice {
    let expectedRawValue: {
      number: number;
      supplierId: number;
      description: number;
      totalPrice: number;
      discount: number;
      paidPrice: number;
      items: {
        productId: number;
        colorId: number;
        sizeId: number;
        quantity: number;
        purchaseUnitPrice: number;
        sellingUnitPrice: number;
      }[];
    };

    try {
      expectedRawValue = value;
      return {
        number: value.number,
        supplierId: value.supplierId,
        description: value.description,
        totalPrice: value.totalPrice,
        discount: value.discount,
        paidPrice: value.paidPrice,
        items: value.items,
      }
    } catch (e) {
      throw e;
    }
  }
}

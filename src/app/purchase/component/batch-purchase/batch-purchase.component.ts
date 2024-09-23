import {Component, DestroyRef, EventEmitter, inject, OnInit, Output} from '@angular/core';
import {ImageUploaderComponent} from '@shared/component/image-uploader/image-uploader.component';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzTableModule} from 'ng-zorro-antd/table';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {AsyncPipe} from '@angular/common';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {ProductApi} from '@product/api/product.api';
import {NzImageModule} from 'ng-zorro-antd/image';
import {fallbackImageBase64} from '@shared/constant/fallbackImage';
import {catchError, combineLatest, concatMap, EMPTY, filter, from, map, Observable, of, startWith, tap, toArray} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NgxPriceInputComponent} from 'ngx-price-input';
import {SupplierApi} from '@supplier/api/supplier.api';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {PurchaseFacade} from '@purchase/data-access/purchase.facade';
import {CreatePurchaseInvoice, CreatePurchaseItem} from '@purchase/entity/purchase.entity';
import {Product} from '@product/entity/product.entity';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {NzModalModule} from 'ng-zorro-antd/modal';

interface BatchPurchaseForm {
  imageSrc: FormControl<string | null>;
  imageFile: FormControl<File | null>;
  code: FormControl<string | null>;
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  colorId: FormControl<number | null>;
  sizeId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  purchaseUnitPrice: FormControl<number | null>;
  sellingUnitPrice: FormControl<number | null>;
}

@Component({
  standalone: true,
  selector: 'batch-purchase',
  templateUrl: './batch-purchase.component.html',
  imports: [
    ImageUploaderComponent,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzImageModule,
    NzSelectModule,
    NzDividerModule,
    NzEmptyModule,
    NzProgressModule,
    NzModalModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgxPriceInputComponent
  ]
})
export class BatchPurchaseComponent implements OnInit {
  @Output() onFormsSubmitted = new EventEmitter<boolean>();
  batchPurchaseForm = new FormArray<FormGroup<BatchPurchaseForm>>([], [Validators.required, Validators.minLength(1)]);
  defaultProductFrom = new FormGroup({
    prefixCode: new FormControl<string>('ABC'),
    productName: new FormControl<string | null>(null),
    productDescription: new FormControl<string | null>(null),
    defaultPurchasePrice: new FormControl<number | null>(null),
    defaultSellPrice: new FormControl<number | null>(null)
  });
  purchaseInvoiceForm = new FormGroup({
    number: new FormControl<string | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    totalPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required),
    discount: new FormControl<number | null>(0, Validators.required),
    paidPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required)
  });
  protected readonly fallbackImageBase64 = fallbackImageBase64;
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApi);
  colors$ = this.productApi.colors$;
  sizes$ = this.productApi.sizes$;
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly supplierApi = inject(SupplierApi);
  suppliers$ = this.supplierApi.suppliers$;
  isProgressModalVisible = false;
  progressPercentage = 0;
  progressMessage = 'در حال شروع پروسه‌ی ثبت محصولات...';

  ngOnInit() {
    this.setBatchValues();
    this.subscribeToBatchPurchaseFormAndUpdateTotalPrice();
    this.subscribeToPurchaseInvoiceFormAndUpdatePaidPrice();
  }

  addProduct(form: FormGroup) {
    this.batchPurchaseForm.push(form);
  }

  handleMultipleFiles(files: File[] | null) {
    const prefixCode = this.defaultProductFrom.controls.prefixCode.value;
    if (!prefixCode) throw new Error('Prefix code is required');
    if (files) {
      files.forEach((f, index) => {
        const tempForm = new FormGroup({
          imageSrc: new FormControl<string | null>(URL.createObjectURL(f), Validators.required),
          imageFile: new FormControl<File | null>(f, Validators.required),
          code: new FormControl<string | null>(this.generateCode(prefixCode, index), Validators.required),
          name: new FormControl<string | null>(null, Validators.required),
          desc: new FormControl<string | null>(null, Validators.required),
          color: new FormControl<number | null>(null, Validators.required),
          size: new FormControl<number | null>(null, Validators.required),
          quantity: new FormControl<number>(1, Validators.required),
          purchasePrice: new FormControl<number | null>(null, Validators.required),
          sellPrice: new FormControl<number | null>(null, Validators.required)
        });
        this.addProduct(tempForm);
      });
    }
  }

  submitInvoice() {
    const totalProducts = this.getProductFormsData().length;
    let submittedProducts = 0;

    this.isProgressModalVisible = true;
    this.processProductSubmissions(totalProducts, submittedProducts)
      .pipe(
        map(items => this.createInvoiceObject(items)),
        tap(() => {
          this.progressPercentage = 100;
          this.progressMessage = 'همه محصولات با موفقیت ثبت شدند!';
          setTimeout(() => {
            this.isProgressModalVisible = false;
            this.batchPurchaseForm.reset();
            this.defaultProductFrom.reset();
            this.purchaseInvoiceForm.reset();
            this.onFormsSubmitted.emit(true);
          }, 2000);
        }),
        catchError(error => {
          console.error('Error creating invoice:', error);
          this.progressMessage = 'خطایی در حال ثبت رخ داد.';
          return EMPTY;
        })
      )
      .subscribe(invoice => this.purchaseFacade.createPurchase(invoice));
  }

  /**
   * Processes the product submissions sequentially and returns an observable of items.
   */
  private processProductSubmissions(totalProducts: number, submittedProducts: number): Observable<CreatePurchaseItem[]> {
    const productFormsData = this.getProductFormsData();

    return from(productFormsData).pipe(
      concatMap(formData => this.createProductItem(formData).pipe(
        tap(() => {
          submittedProducts++;
          this.progressPercentage = Math.round((submittedProducts / totalProducts) * 100);
          this.progressMessage = `${submittedProducts} از ${totalProducts} محصول...`;
        }))),
      toArray(),
      map(items => items.filter(item => item !== null) as CreatePurchaseItem[])
    );
  }

  /**
   * Creates a product and maps it to a purchase item.
   * @param formData - The form data for the product.
   */
  private createProductItem(formData: FormData): Observable<CreatePurchaseItem | null> {
    return this.productApi.createProduct$(formData).pipe(
      map(product => this.mapProductToPurchaseItem(product)),
      catchError(error => {
        console.error('Error creating product:', error);
        this.progressMessage = 'خطایی در حال ثبت رخ داد.';
        return of(null);
      })
    );
  }

  /**
   * Maps a product to a purchase item using the form controls.
   * @param product - The created product.
   */
  private mapProductToPurchaseItem(product: Product): CreatePurchaseItem | null {
    const matchedPurchaseItem = this.batchPurchaseForm.controls.find(
      control => control.controls.code.value === product.code
    );
    if (!matchedPurchaseItem) {
      console.warn(`No matching purchase item found for product code: ${product.code}`);
      return null;
    }
    const invoiceForm = matchedPurchaseItem.getRawValue() as {
      colorId: number,
      sizeId: number,
      quantity: number,
      purchaseUnitPrice: number,
      sellingUnitPrice: number
    };
    return {
      productId: product.id,
      colorId: invoiceForm.colorId,
      sizeId: invoiceForm.sizeId,
      quantity: invoiceForm.quantity,
      purchaseUnitPrice: invoiceForm.purchaseUnitPrice,
      sellingUnitPrice: invoiceForm.sellingUnitPrice
    };
  }

  /**
   * Creates the invoice object from the purchase items.
   * @param items - The array of purchase items.
   */
  private createInvoiceObject(items: CreatePurchaseItem[]): CreatePurchaseInvoice {
    const purchaseInvoice = this.purchaseInvoiceForm.getRawValue() as Omit<CreatePurchaseInvoice, 'items'>;
    return {
      number: purchaseInvoice.number,
      supplierId: purchaseInvoice.supplierId,
      description: purchaseInvoice.description,
      totalPrice: purchaseInvoice.totalPrice,
      discount: purchaseInvoice.discount,
      paidPrice: purchaseInvoice.paidPrice,
      items
    };
  }

  private generateCode(prefix: string, index: number): string {
    const numberPart = index.toString().padStart(3, '0');
    return `${prefix}${numberPart}`;
  }

  private getProductFormsData(): FormData[] {
    const batchProducts = this.batchPurchaseForm.controls.map(control => {
      return control.getRawValue() as {
        code: string,
        name: string,
        description: string,
        imageFile: File
      };
    });
    return batchProducts.map(form => {
      const formData = new FormData();
      formData.append('code', form.code);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('image', form.imageFile, form.imageFile.name);
      return formData;
    });
  }

  private setBatchValues() {
    this.defaultProductFrom.controls.prefixCode.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((prefixCode) => {
      this.batchPurchaseForm.controls.forEach((control, index) => {
        control.controls.code.setValue(this.generateCode(prefixCode, index));
      });
    });
    this.defaultProductFrom.controls.productName.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((productName) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.name.setValue(productName);
      });
    });
    this.defaultProductFrom.controls.productDescription.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((productDescription) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.description.setValue(productDescription);
      });
    });
    this.defaultProductFrom.controls.defaultPurchasePrice.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((defaultPurchasePrice) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.purchaseUnitPrice.setValue(defaultPurchasePrice);
      });
    });
    this.defaultProductFrom.controls.defaultSellPrice.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((defaultSellPrice) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.sellingUnitPrice.setValue(defaultSellPrice);
      });
    });
  }

  private subscribeToPurchaseInvoiceFormAndUpdatePaidPrice() {
    combineLatest([this.purchaseInvoiceForm.controls.totalPrice.valueChanges, this.purchaseInvoiceForm.controls.discount.valueChanges.pipe(startWith(0))]).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(([totalPrice, discount]) => {
        return (totalPrice || 0) - (discount || 0);
      })
    ).subscribe((paidPrice) => {
      this.purchaseInvoiceForm.controls.paidPrice.setValue(paidPrice, {emitEvent: false});
    });
  }

  private subscribeToBatchPurchaseFormAndUpdateTotalPrice() {
    this.batchPurchaseForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), map((forms) => {
      return forms.reduce((acc, form) => acc + (form.quantity || 0) * (form.purchaseUnitPrice || 0), 0);
    })).subscribe((value) => {
      this.purchaseInvoiceForm.controls.totalPrice.setValue(value);
    });
  }
}

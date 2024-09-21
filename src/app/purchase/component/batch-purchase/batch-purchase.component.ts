import {Component, DestroyRef, inject, OnInit} from '@angular/core';
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
import {filter, firstValueFrom} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NgxPriceInputComponent} from "ngx-price-input";
import {SupplierApi} from "@supplier/api/supplier.api";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {PurchaseFacade} from "@purchase/data-access/purchase.facade";
import {CreatePurchaseInvoice} from "@purchase/entity/purchase.entity";

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
    ReactiveFormsModule,
    AsyncPipe,
    NgxPriceInputComponent
  ]
})
export class BatchPurchaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApi);
  private readonly supplierApi = inject(SupplierApi);
  private readonly purchaseFacade = inject(PurchaseFacade);
  protected readonly fallbackImageBase64 = fallbackImageBase64;
  suppliers$ = this.supplierApi.suppliers$;
  colors$ = this.productApi.colors$;
  sizes$ = this.productApi.sizes$;

  /**
   * Form group for purchase invoice
   */
  purchaseInvoiceForm = new FormGroup({
    number: new FormControl<string | null>(null, Validators.required),
    supplierId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    totalPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required),
    discount: new FormControl<number | null>(null, Validators.required),
    paidPrice: new FormControl<number | null>({value: 0, disabled: true}, Validators.required),
  })

  /**
   * Form array for purchase products
   */
  batchPurchaseForm = new FormArray<FormGroup<{
    imageSrc: FormControl<string | null>;
    imageFile: FormControl<File | null>;
    code: FormControl<string | null>;
    name: FormControl<string | null>;
    desc: FormControl<string | null>;
    color: FormControl<number | null>;
    size: FormControl<number | null>;
    quantity: FormControl<number | null>;
    purchasePrice: FormControl<number | null>;
    sellPrice: FormControl<number | null>;
  }>>([]);

  /**
   * Form group for getting default products data to apply to all purchase products
   */
  defaultProductFrom = new FormGroup({
    prefixCode: new FormControl<string>('ABC'),
    productName: new FormControl<string | null>(null),
    productDescription: new FormControl<string | null>(null),
    defaultPurchasePrice: new FormControl<number | null>(null),
    defaultSellPrice: new FormControl<number | null>(null)
  });

  ngOnInit() {
    this.setBatchValues();
  }

  private getProductFormsData(): FormData[] {
    const batchProducts = this.batchPurchaseForm.controls.map(control => control.value);
    return batchProducts.map(form => {
      const formData = new FormData();
      if (form.imageFile && form.code && form.name && form.desc) {
        formData.append('code', form.code);
        formData.append('name', form.name);
        formData.append('description', form.desc);
        formData.append('image', form.imageFile, form.imageFile.name);
      }
      return formData;
    });
  }

  private generateCode(prefix: string, index: number): string {
    const numberPart = index.toString().padStart(3, '0');
    return `${prefix}${numberPart}`;
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
        control.controls.desc.setValue(productDescription);
      });
    });
    this.defaultProductFrom.controls.defaultPurchasePrice.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((defaultPurchasePrice) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.purchasePrice.setValue(defaultPurchasePrice);
      });
    });
    this.defaultProductFrom.controls.defaultSellPrice.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((defaultSellPrice) => {
      this.batchPurchaseForm.controls.forEach((control) => {
        control.controls.sellPrice.setValue(defaultSellPrice);
      });
    });
  }

  submitInvoice() {
    const productFormsData = this.getProductFormsData();
    const items: {
      productId: number;
      colorId: number;
      sizeId: number;
      quantity: number;
      purchaseUnitPrice: number;
      sellingUnitPrice: number;
    }[] = [];
    productFormsData.forEach(formData => {
      firstValueFrom(this.productApi.createProduct$(formData)).then((product) => {
        const invoiceForm = this.batchPurchaseForm.controls.find(control => control.controls.code.value === product.code)?.getRawValue();
        if (invoiceForm) {
          items.push({
            productId: product.id,
            colorId: invoiceForm.color!,
            sizeId: invoiceForm.size!,
            quantity: invoiceForm.quantity!,
            purchaseUnitPrice: invoiceForm.purchasePrice!,
            sellingUnitPrice: invoiceForm.sellPrice!
          })
        }
      })
    });
    const invoice: CreatePurchaseInvoice = {
      number: this.purchaseInvoiceForm.controls.number.value!,
      supplierId: this.purchaseInvoiceForm.controls.supplierId.value!,
      description: this.purchaseInvoiceForm.controls.description.value!,
      totalPrice: this.purchaseInvoiceForm.controls.totalPrice.value!,
      discount: this.purchaseInvoiceForm.controls.discount.value!,
      paidPrice: this.purchaseInvoiceForm.controls.paidPrice.value!,
      items
    }
    this.purchaseFacade.createPurchase(invoice);
  }
}

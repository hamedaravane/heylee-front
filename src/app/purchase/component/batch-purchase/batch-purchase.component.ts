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
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {CurrencyInputComponent} from '@shared/component/currency-input/currency-input.component';

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
    ReactiveFormsModule,
    AsyncPipe,
    CurrencyInputComponent
  ]
})
export class BatchPurchaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApi = inject(ProductApi);
  protected readonly fallbackImageBase64 = fallbackImageBase64;
  batchPurchaseForm = new FormArray<FormGroup<{
    imageSrc: FormControl<string | null>;
    code: FormControl<string | null>;
    name: FormControl<string | null>;
    desc: FormControl<string | null>;
    color: FormControl<number | null>;
    size: FormControl<number | null>;
    quantity: FormControl<number | null>;
    purchasePrice: FormControl<number | null>;
    sellPrice: FormControl<number | null>;
  }>>([]);
  colors$ = this.productApi.colors$;
  defaultProductFrom = new FormGroup({
    prefixCode: new FormControl<string>('ABC'),
    productName: new FormControl<string | null>(null),
    productDescription: new FormControl<string | null>(null),
    defaultPurchasePrice: new FormControl<number | null>(null),
    defaultSellPrice: new FormControl<number | null>(null)
  });
  productFiles: File[] | null = null;
  productSrcImages: string[] | null = null;
  sizes$ = this.productApi.sizes$;

  get nzData() {
    return this.batchPurchaseForm.value;
  }

  ngOnInit() {
    this.setDefaultValues();
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
      files.forEach((_, index) => {
        const tempForm = new FormGroup({
          imageSrc: new FormControl<string | null>(URL.createObjectURL(_), Validators.required),
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
      this.productFiles = files;
      this.productSrcImages = files.map(file => URL.createObjectURL(file));
    }
  }

  private setDefaultValues() {
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
}

import {Component, inject, OnInit} from "@angular/core";
import {ImageUploaderComponent} from "@shared/component/image-uploader/image-uploader.component";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTableModule} from "ng-zorro-antd/table";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";
import {AsyncPipe} from "@angular/common";
import {NzSelectModule} from "ng-zorro-antd/select";
import {ProductApi} from "@product/api/product.api";
import {NzImageModule} from "ng-zorro-antd/image";
import {fallbackImageBase64} from "@shared/constant/fallbackImage";

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
    ReactiveFormsModule,
    AsyncPipe,
  ]
})
export class BatchPurchaseComponent implements OnInit {
  private readonly productApi = inject(ProductApi);
  sizes$ = this.productApi.sizes$;
  colors$ = this.productApi.colors$;
  productSrcImages: string[] | null = null;
  productFiles: File[] | null = null;

  defaultProductFrom = new FormGroup({
    prefixCode: new FormControl<string>('ABC'),
    productName: new FormControl<string | null>(null),
    productDescription: new FormControl<string | null>(null)
  })

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
  }>>([])

  get nzData() {
    return this.batchPurchaseForm.value;
  }

  ngOnInit() {}

  addProduct(form: FormGroup) {
    this.batchPurchaseForm.push(form)
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
          sellPrice: new FormControl<number | null>(null, Validators.required),
        })
        this.addProduct(tempForm);
      })
      this.productFiles = files;
      this.productSrcImages = files.map(file => URL.createObjectURL(file))
    }
  }

  private generateCode(prefix: string, index: number): string {
    const numberPart = index.toString().padStart(3, '0');
    return `${prefix}${numberPart}`;
  }

  protected readonly fallbackImageBase64 = fallbackImageBase64;
}

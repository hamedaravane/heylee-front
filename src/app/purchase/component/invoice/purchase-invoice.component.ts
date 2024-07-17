import {Component, inject} from '@angular/core';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Purchase} from '@purchase/entity/purchase.entity';
import {PurchaseFacade} from '@purchase/data-access/purchase.facade';
import {BidiModule} from "@angular/cdk/bidi";
import {DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {NzAutosizeDirective, NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {NzDividerModule} from "ng-zorro-antd/divider";

@Component({
  selector: 'purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  imports: [
    BidiModule,
    NgTemplateOutlet,
    NzAutosizeDirective,
    NzDividerModule,
    NzButtonComponent,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzInputGroupComponent,
    NzRowDirective,
    ReactiveFormsModule,
    DecimalPipe,
    NgOptimizedImage,
    NzEmptyComponent,
    NzWaveDirective
  ],
  standalone: true
})
export class PurchaseInvoiceComponent {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly fb = inject(FormBuilder);

  purchaseForm = this.fb.group({
    number: new FormControl<string>('', Validators.required),
    supplierId: new FormControl<number>(0, Validators.required),
    description: new FormControl<string>('', Validators.required),
    totalPrice: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    paidPrice: new FormControl<number>(0, Validators.required),
    items: this.fb.array([])
  });

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.fb.group({
      productId: [null, Validators.required],
      colorId: [null, Validators.required],
      sizeId: [null, Validators.required],
      quantity: [1, Validators.required],
      purchaseUnitPrice: [0, Validators.required],
      sellingUnitPrice: [0, Validators.required]
    }));
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  async submitPurchaseForm(): Promise<void> {
    try {
      const formValue = this.purchaseForm.getRawValue() as Purchase;
      await this.purchaseFacade.createPurchase(formValue);
    } catch (e) {
      console.error(e);
    }
  }
}

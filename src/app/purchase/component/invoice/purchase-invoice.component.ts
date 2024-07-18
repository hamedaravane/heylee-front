import { Component, inject } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Purchase } from '@purchase/entity/purchase.entity';
import { PurchaseFacade } from '@purchase/data-access/purchase.facade';

@Component({
  selector: 'purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  imports: [
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDividerModule,
    NzEmptyModule,
    NzAutocompleteModule,
    BidiModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    DecimalPipe,
    NgOptimizedImage,
  ],
  standalone: true
})
export class PurchaseInvoiceComponent {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly fb = inject(FormBuilder);
  suggestionSellPricesByPercentage = [30, 50, 60, 70, 100];

  purchaseForm = new FormGroup({
    number: new FormControl<string>('', Validators.required),
    supplierId: new FormControl<number>(0, Validators.required),
    description: new FormControl<string>('', Validators.required),
    totalPrice: new FormControl<number>({value: 0, disabled: true}, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    paidPrice: new FormControl<number>({value: 0, disabled: true}, Validators.required),
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

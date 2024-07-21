import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Purchase } from '@purchase/entity/purchase.entity';
import { PurchaseFacade } from '@purchase/data-access/purchase.facade';
import { BidiModule } from '@angular/cdk/bidi';
import { DecimalPipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { combineLatestWith, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { colorLabels, sizeLabels } from '@labels';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

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
    BidiModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    DecimalPipe,
    NgOptimizedImage,
    PageContainerComponent,
    CardContainerComponent
  ],
  standalone: true
})
export class PurchaseInvoiceComponent implements OnInit {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  sizeLabels = sizeLabels;
  colorLabels = colorLabels;
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

  totalPriceControl = this.purchaseForm.get('totalPrice') as AbstractControl<number>;
  paidPriceControl = this.purchaseForm.get('paidPrice') as AbstractControl<number>;
  discountControl = this.purchaseForm.get('discount') as AbstractControl<number>;

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
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
        const paidPrice = totalPrice - discount;
        this.paidPriceControl.setValue(paidPrice);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  addItem() {
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
    const items = this.items.controls as FormGroup[];
    let newTotalPrice = 0;

    items.forEach(item => {
      const purchaseUnitPrice = item.get('purchaseUnitPrice')?.value || 0;
      const quantity = item.get('quantity')?.value || 0;
      newTotalPrice += (purchaseUnitPrice * quantity);
    });

    this.totalPriceControl.setValue(newTotalPrice);
  }

  private subscribeToItemChanges(item?: FormGroup) {
    (item ? [item] : this.items.controls).forEach(control => {
      const priceChangeSubscription = control.get('purchaseUnitPrice')?.valueChanges.subscribe(() => {
        this.updateTotalPrice();
      });

      const quantityChangeSubscription = control.get('quantity')?.valueChanges.subscribe(() => {
        this.updateTotalPrice();
      });
    });
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.updateTotalPrice();
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

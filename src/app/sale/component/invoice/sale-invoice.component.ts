import {Component, inject} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, ReactiveFormsModule, NgIf, NgForOf],
  standalone: true,
  templateUrl: './sale-invoice.component.html',
})
export class SaleInvoiceComponent {
  private formBuilder = inject(FormBuilder);
  saleFormGroup = this.formBuilder.group({
    customerFirstName: ['', Validators.required],
    customerLastName: ['', Validators.required],
    customerCity: ['', Validators.required],
    customerAddress: ['', Validators.required],
    customerPhone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    saleItems: this.formBuilder.array([this.createSaleItem()])
  });

  get saleItems(): FormArray {
    return this.saleFormGroup.get('saleItems') as FormArray;
  }

  createSaleItem(): FormGroup {
    return this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      color: ['', Validators.required],
      colorHexCode: ['', Validators.required],
      size: ['', Validators.required],
      sizeUnit: ['', Validators.required]
    });
  }

  addSaleItem() {
    this.saleItems.push(this.createSaleItem());
  }

  removeSaleItem(index: number) {
    this.saleItems.removeAt(index);
  }

  submitOrderForm() {
    console.log(this.saleFormGroup.value);
  }
}

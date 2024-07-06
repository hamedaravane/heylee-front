import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './sale-invoice.component.html',
})
export class SaleInvoiceComponent {
  private formBuilder = inject(FormBuilder);
  orderForm = this.formBuilder.group({
    saleItems: this.formBuilder.array([]) as FormArray,
    customer: this.formBuilder.group({
      name: '',
      address: '',
      phone: '',
      city: '',
      postalCode: '',
      description: ''
    })
  })

  addNewProduct() {
    const productGroup = this.formBuilder.group({
      name: [''],
      quantity: [1],
      price: ['']
    });
    this.orderForm.get('saleItems')
  }

  onSubmit() {
    console.log(this.orderForm.value);
  }
}
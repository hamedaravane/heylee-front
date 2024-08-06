import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomerFacade} from '../../data-access/customer.facade';
import {CreateCustomer, Customer} from '../../entity/customer.entity';
import {NzInputModule} from 'ng-zorro-antd/input';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PhoneFormatPipe} from '@shared/pipe/phone-format.pipe';

@Component({
  standalone: true,
  selector: 'customer',
  templateUrl: './customers.component.html',
  imports: [
    AsyncPipe,
    BidiModule,
    NzDrawerModule,
    NzInputModule,
    NzFormModule,
    NzDividerModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzButtonModule,
    RouterLink,
    ReactiveFormsModule,
    PageContainerComponent,
    CardContainerComponent,
    NgTemplateOutlet,
    PhoneFormatPipe
  ]
})
export class CustomersComponent implements OnInit {
  private readonly customerFacade = inject(CustomerFacade);
  private readonly destroyRef = inject(DestroyRef);
  customersIndex$ = this.customerFacade.customersIndex$;
  loadingState = false;
  isAddCustomerVisible = false;
  isEditCustomerVisible = false;
  selectedCustomerId: number | null = null;

  createCustomerForm = new FormGroup({
    name: new FormControl<string | null>(null, Validators.required),
    address: new FormControl<string | null>(null, Validators.required),
    phone: new FormControl<string | null>(null, Validators.required),
    instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
    city: new FormControl<string | null>(null, Validators.required),
    postalCode: new FormControl<string | null>(null),
  })

  ngOnInit() {
    this.customerFacade.loadCustomers().then();
    this.customerFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => this.loadingState = loading)
  }

  selectCustomerToEdit(customer: Customer) {
    this.selectedCustomerId = customer.id;
    this.createCustomerForm.setValue({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      postalCode: customer.postalCode,
      city: customer.city,
      instagram: customer.instagram,
      telegram: customer.telegram
    });
    this.isEditCustomerVisible = true;
  }

  editCustomer() {
    const form = this.createCustomerForm.getRawValue() as CreateCustomer;
    if (this.selectedCustomerId) {
      this.customerFacade.editCustomer(this.selectedCustomerId, form).then(() => {
        this.closeAddCustomer();
      });
    }
  }

  createCustomer() {
    const form = this.createCustomerForm.getRawValue() as CreateCustomer;
    this.customerFacade.createCustomer(form).then(() => {
      this.closeAddCustomer();
    });
  }

  deleteCustomer(id: number) {
    this.customerFacade.deleteCustomer(id).then(() => {
      this.closeAddCustomer();
    });
  }

  closeAddCustomer() {
    this.isAddCustomerVisible = false;
    this.isEditCustomerVisible = false;
    this.createCustomerForm.reset();
  }
}

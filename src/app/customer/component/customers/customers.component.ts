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
import {CreateCustomer} from '../../entity/customer.entity';
import {NzInputModule} from 'ng-zorro-antd/input';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
    NgTemplateOutlet
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
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    instagram: new FormControl('', [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl('', [Validators.minLength(5), Validators.maxLength(32)]),
    city: new FormControl('', Validators.required),
    postalCode: new FormControl('', Validators.required),
  })

  ngOnInit() {
    this.loadCustomers();
    this.customerFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => this.loadingState = loading)
  }

  loadCustomers() {
    this.customerFacade.loadCustomers().then();
  }

  selectCustomerToEdit(id: number) {
    this.selectedCustomerId = id;
    this.isEditCustomerVisible = true;
  }

  editCustomer() {
    const form = this.createCustomerForm.getRawValue() as CreateCustomer;
    if (this.selectedCustomerId) {
      this.customerFacade.editCustomer(this.selectedCustomerId, form).then(() => {
        this.closeAddCustomer();
        this.createCustomerForm.reset();
      });
    }
  }

  createCustomer() {
    const form = this.createCustomerForm.getRawValue() as CreateCustomer;
    this.customerFacade.createCustomer(form).then(() => {
      this.closeAddCustomer();
      this.createCustomerForm.reset();
    });
  }

  deleteCustomer(id: number) {
    this.customerFacade.deleteCustomer(id).then(() => {
      this.closeAddCustomer();
      this.createCustomerForm.reset();
    });
  }

  closeAddCustomer() {
    this.isAddCustomerVisible = false;
    this.isEditCustomerVisible = false;
  }
}

import {Component, inject} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {BidiModule} from "@angular/cdk/bidi";
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NzButtonModule} from "ng-zorro-antd/button";
import {RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CustomerFacade} from "../../data-access/customer.facade";
import {Customer} from "../../entity/customer.entity";
import {NzInputModule} from "ng-zorro-antd/input";

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
  ]
})
export class CustomersComponent {
  private readonly customerFacade = inject(CustomerFacade);
  customersIndex$ = this.customerFacade.customersIndex$;
  isAddCustomerVisible = false;

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
    this.customerFacade.loadCustomers().then();
  }

  editCustomer(id: number, customer: Customer) {
    this.customerFacade.editCustomer(id, customer).then();
  }

  createCustomer() {
  }

  deleteCustomer(id: number) {
    this.customerFacade.deleteCustomer(id).then();
  }

  closeAddCustomer() {
    this.isAddCustomerVisible = false;
  }
}

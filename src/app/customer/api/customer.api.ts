import {inject, Injectable} from "@angular/core";
import {CustomerFacade} from "@customer/data-access/customer.facade";
import {CreateCustomer} from "@customer/entity/customer.entity";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CustomerApi {
  private readonly customerFacade = inject(CustomerFacade);
  private isFetched = false;

  get customers$() {
    if(!this.isFetched) {
      this.customerFacade.loadCustomers().then(() => {
        this.isFetched = true;
      })
      return this.customerFacade.customersIndex$;
    }
    return this.customerFacade.customersIndex$;
  }

  createCustomer(customer: CreateCustomer) {
    return this.customerFacade.createCustomer(customer).then(() => {
      return firstValueFrom(this.customerFacade.customer$);
    });
  }
}

import {inject, Injectable} from "@angular/core";
import {CustomerFacade} from "@customer/data-access/customer.facade";

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
}

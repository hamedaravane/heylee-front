import { inject, Injectable } from '@angular/core';
import { CustomerInfra } from '../infrastructure/customer.infra';
import { firstValueFrom, Subject } from 'rxjs';
import { IndexResponse } from '@shared/entity/server-response.entity';
import { CreateCustomer, Customer } from '../entity/customer.entity';

@Injectable({
  providedIn: 'root'
})
export class CustomerFacade {
  private readonly customerInfra = inject(CustomerInfra);
  private readonly customerSubject = new Subject<Customer>();
  private readonly customersIndexSubject = new Subject<IndexResponse<Customer>>();

  get customer$() {
    return this.customerSubject.asObservable()
  };

  get customersIndex$() {
    return this.customersIndexSubject.asObservable()
  };

  async loadCustomers() {
    try {
      const response = await firstValueFrom(this.customerInfra.fetchCustomers());
      this.customersIndexSubject.next(response);
    } catch (error) {
      console.error('Error in CustomerFacade loadCustomers:', error);
    }
  }

  async createCustomer(customer: CreateCustomer): Promise<void> {
    try {
      const newCustomer = await firstValueFrom(this.customerInfra.createCustomer(customer));
      this.customerSubject.next(newCustomer);
    } catch (error) {
      console.error('Error in CustomerFacade createCustomer:', error);
    }
  }

  async editCustomer(id: number, customer: CreateCustomer) {
    try {
      const response = await firstValueFrom(this.customerInfra.editCustomer(id, customer));
      this.customerSubject.next(response);
    } catch (error) {
      console.error('Error in CustomerFacade editCustomer:', error);
    }
  }

  async deleteCustomer(id: number) {
    try {
      await firstValueFrom(this.customerInfra.deleteCustomer(id));
    } catch (error) {
      console.error('Error in CustomerFacade deleteCustomer:', error);
    }
  }
}

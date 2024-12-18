import { Injectable } from '@angular/core';
import {
  Customer,
  CustomerDto,
  FromCustomerDto,
  mapCustomerDtoToCustomer,
  mapCustomerToDto
} from '../entity/customer.entity';
import { Observable } from 'rxjs';
import { IndexResponse } from '@shared/entity/server-response.entity';
import { FilterIndex } from '@shared/entity/common.entity';
import { BaseInfra } from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root'
})
export class CustomerInfra extends BaseInfra {
  private readonly endpoint = 'customer';

  createCustomer(customer: FromCustomerDto): Observable<Customer> {
    return this.createEntity<FromCustomerDto, CustomerDto, Customer>(
      this.endpoint,
      customer,
      mapCustomerDtoToCustomer,
      mapCustomerToDto
    );
  }

  updateCustomer(id: number, customer: FromCustomerDto): Observable<Customer> {
    return this.updateEntity<FromCustomerDto, CustomerDto, Customer>(
      this.endpoint,
      id,
      customer,
      mapCustomerDtoToCustomer
    );
  }

  fetchCustomers(pageIndex: number = 1, filter?: FilterIndex<CustomerDto>[]): Observable<IndexResponse<Customer>> {
    return this.fetchEntities<CustomerDto, Customer>(this.endpoint, mapCustomerDtoToCustomer, pageIndex, filter);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.deleteEntity<CustomerDto>(this.endpoint, id);
  }
}

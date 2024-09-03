import {Injectable} from '@angular/core';
import {
  CreateCustomerDto,
  Customer,
  CustomerDto,
  mapCustomerDtoToCustomer,
  mapCustomerToDto
} from '../entity/customer.entity';
import {Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from '@shared/entity/common.entity';
import {BaseInfra} from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root'
})
export class CustomerInfra extends BaseInfra {
  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.createEntity<CreateCustomerDto, CustomerDto, Customer>('customer/create', customer, mapCustomerDtoToCustomer, mapCustomerToDto)
  }

  editCustomer(id: number, customer: CreateCustomerDto): Observable<Customer> {
    return this.updateEntity<CreateCustomerDto, CustomerDto, Customer>(
      'customer',
      id,
      customer,
      mapCustomerDtoToCustomer
    );
  }

  fetchCustomers(pageIndex: number = 1, filter?: FilterIndex<CustomerDto>[]): Observable<IndexResponse<Customer>> {
    return this.fetchEntities<CustomerDto, Customer>(
      'customer/index',
      mapCustomerDtoToCustomer,
      pageIndex,
      '',
      filter,
      50,
    );
  }

  deleteCustomer(id: number): Observable<void> {
    return this.deleteEntity<CustomerDto>(
      'customer',
      id,
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { CustomerInfra } from '../infrastructure/customer.infra';
import { BehaviorSubject, filter, firstValueFrom, Subject } from 'rxjs';
import { IndexResponse } from '@shared/entity/server-response.entity';
import { Customer, CustomerDto, FormCustomer, FromCustomerDto } from '../entity/customer.entity';
import { toSnakeCase } from '@shared/entity/utility.entity';
import { FilterIndex } from '@shared/entity/common.entity';
import { BaseFacade } from '@shared/service/base.facade';

@Injectable({
  providedIn: 'root'
})
export class CustomerFacade extends BaseFacade {
  private readonly customerInfra = inject(CustomerInfra);
  private readonly customerSubject = new Subject<Customer>();
  private readonly customersIndexSubject = new BehaviorSubject<IndexResponse<Customer> | null>(null);

  get customer$() {
    return this.customerSubject.asObservable();
  }

  get customersIndex$() {
    return this.customersIndexSubject.asObservable().pipe(filter(Boolean));
  }

  async loadCustomers(pageIndex: number = 1, filter?: FilterIndex<CustomerDto>[]) {
    await this.loadEntity(
      this.customersIndexSubject,
      () => firstValueFrom(this.customerInfra.fetchCustomers(pageIndex, filter)),
      undefined,
      true
    );
  }

  async createCustomer(customer: FormCustomer): Promise<void> {
    const dto: FromCustomerDto = toSnakeCase(customer);
    await this.loadEntity(
      this.customerSubject,
      () => firstValueFrom(this.customerInfra.createCustomer(dto)),
      () => this.loadCustomers()
    );
  }

  async editCustomer(id: number, customer: FormCustomer) {
    const dto: FromCustomerDto = toSnakeCase(customer);
    await this.loadEntity(
      this.customerSubject,
      () => firstValueFrom(this.customerInfra.updateCustomer(id, dto)),
      () => this.loadCustomers()
    );
  }

  async deleteCustomer(id: number) {
    await this.deleteEntity(
      () => firstValueFrom(this.customerInfra.deleteCustomer(id)),
      () => this.loadCustomers()
    );
  }
}

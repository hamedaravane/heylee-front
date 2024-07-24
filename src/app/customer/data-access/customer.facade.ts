import {inject, Injectable} from '@angular/core';
import {CustomerInfra} from '../infrastructure/customer.infra';
import {BehaviorSubject, filter, firstValueFrom, Subject} from 'rxjs';
import {IndexResponse, ServerError} from '@shared/entity/server-response.entity';
import {CreateCustomer, CreateCustomerDto, Customer} from '../entity/customer.entity';
import {toSnakeCase} from '@shared/entity/utility.entity';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class CustomerFacade {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly customerInfra = inject(CustomerInfra);
  private readonly customerSubject = new Subject<Customer>();
  private readonly customersIndexSubject = new BehaviorSubject<IndexResponse<Customer> | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$() {
    return this.loadingSubject.asObservable();
  }

  get customer$() {
    return this.customerSubject.asObservable()
  };

  get customersIndex$() {
    return this.customersIndexSubject.asObservable().pipe(filter(Boolean))
  };

  async loadCustomers() {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.customerInfra.fetchCustomers());
      this.customersIndexSubject.next(response);
    } catch (err) {
      const error = err as ServerError;
      console.error('Error in CustomerFacade loadCustomers:', error.error.result);
      this.nzMessageService.error(error.error.result.message)
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createCustomer(customer: CreateCustomer): Promise<void> {
    this.loadingSubject.next(true);
    const dto: CreateCustomerDto = toSnakeCase(customer);
    try {
      const newCustomer = await firstValueFrom(this.customerInfra.createCustomer(dto));
      this.customerSubject.next(newCustomer);
      await this.loadCustomers();
      this.nzMessageService.success('مشتری جدید اضافه شد.');
    } catch (err) {
      const error = err as ServerError;
      console.error('Error in CustomerFacade createCustomer:', error.error.result);
      this.nzMessageService.error(error.error.result.message)
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async editCustomer(id: number, customer: CreateCustomer) {
    this.loadingSubject.next(true);
    const dto: CreateCustomerDto = toSnakeCase(customer);
    try {
      const response = await firstValueFrom(this.customerInfra.editCustomer(id, dto));
      this.customerSubject.next(response);
      await this.loadCustomers();
      this.nzMessageService.success('مشتری ویرایش شد');
    } catch (err) {
      const error = err as ServerError;
      console.error('Error in CustomerFacade editCustomer:', error.error.result);
      this.nzMessageService.error(error.error.result.message)
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteCustomer(id: number) {
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.customerInfra.deleteCustomer(id));
      await this.loadCustomers();
      this.nzMessageService.success('مشتری حذف شد.');
    } catch (err) {
      const error = err as ServerError;
      console.error('Error in CustomerFacade deleteCustomer:', error.error.result);
      this.nzMessageService.error(error.error.result.message)
    } finally {
      this.loadingSubject.next(false);
    }
  }
}

import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environment';
import {CreateCustomerDto, Customer, CustomerDto, mapCustomerDtoToCustomer} from '../entity/customer.entity';
import {map, Observable} from 'rxjs';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from '@shared/entity/common.entity';
import {ApiService} from '@shared/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerInfra {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<ServerResponse<CustomerDto>>(`${environment.apiUrl}/customer/create`, customer)
      .pipe(
        map<ServerResponse<CustomerDto>, Customer>((res) => {
          if (res.ok) {
            return dtoConvertor<CustomerDto, Customer>(res.result, mapCustomerDtoToCustomer);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  editCustomer(id: number, customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<ServerResponse<CustomerDto>>(`${environment.apiUrl}/customer/update/${id}`, customer)
      .pipe(
        map<ServerResponse<CustomerDto>, Customer>((res) => {
          if (res.ok) {
            return dtoConvertor<CustomerDto, Customer>(res.result, mapCustomerDtoToCustomer);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }

  fetchCustomers(pageIndex: number = 1, filter?: FilterIndex<CustomerDto>[]): Observable<IndexResponse<Customer>> {
    return this.apiService.fetchEntities<CustomerDto, Customer>(
      'customer/index',
      mapCustomerDtoToCustomer,
      pageIndex,
      '',
      filter,
      50,
    );
  }

  deleteCustomer(id: number): Observable<Customer> {
    return this.http.delete<ServerResponse<CustomerDto>>(`${environment.apiUrl}/customer/delete/${id}`)
      .pipe(
        map<ServerResponse<CustomerDto>, Customer>((res) => {
          if (res.ok) {
            return dtoConvertor<CustomerDto, Customer>(res.result, mapCustomerDtoToCustomer);
          } else {
            throw res.result as unknown;
          }
        })
      )
  }
}

import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@environment';
import {CreateCustomerDto, Customer, CustomerDto, mapCustomerDtoToCustomer} from '../entity/customer.entity';
import {map, Observable} from 'rxjs';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from '@shared/entity/common.entity';

@Injectable({
  providedIn: 'root'
})
export class CustomerInfra {
  private readonly http = inject(HttpClient);

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

  fetchCustomers(pageIndex: number = 1, filter?: FilterIndex<Customer>): Observable<IndexResponse<Customer>> {
    let params = new HttpParams().set('page', pageIndex).append('per-page', 50);
    if (filter) {
      params = params.append(`filter[${filter.prop}][${filter.operator}]`, `${filter.value}`);
    }
    return this.http.get<ServerResponse<IndexResponse<CustomerDto>>>(`${environment.apiUrl}/customer/index`, {params})
      .pipe(
        map((res) => {
          if (res.ok) {
            return dtoConvertor<IndexResponse<CustomerDto>, IndexResponse<Customer>>(res.result, (indexResponse) => {
              return {
                ...indexResponse,
                items: indexResponse.items.map(mapCustomerDtoToCustomer)
              }
            });
          } else {
            throw res.result as unknown;
          }
        })
      )
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

import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environment";
import {Customer, CustomerDto, mapCustomerDtoToCustomer, mapCustomerToDto} from "../entity/customer.entity";
import {map, Observable} from "rxjs";
import {dtoConvertor, IndexResponse, ServerResponse} from "@shared/entity/server-response.entity";

@Injectable({
  providedIn: 'root'
})
export class CustomerInfra {
  private readonly http = inject(HttpClient);

  createCustomer(customer: Customer): Observable<Customer> {
    const dto = mapCustomerToDto(customer);
    return this.http.post<ServerResponse<CustomerDto>>(`${environment.apiUrl}/customer/create`, dto)
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

  editCustomer(id: number, customer: Customer): Observable<Customer> {
    const dto = mapCustomerToDto(customer);
    return this.http.post<ServerResponse<CustomerDto>>(`${environment.apiUrl}/customer/update/${id}`, dto)
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

  fetchCustomers(): Observable<IndexResponse<Customer>> {
    return this.http.get<ServerResponse<IndexResponse<CustomerDto>>>(`${environment.apiUrl}/customer/index`)
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

import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {TransactionDto} from '../entity/transaction.entity';

export class TransactionInfra {
  private readonly http = inject(HttpClient);

  createTransaction(transaction: TransactionDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/accounting-transaction/create`, transaction);
  }

  updateTransaction(id: number, transaction: TransactionDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/accounting-transaction/update/${id}`, transaction);
  }

  viewTransaction(id: number): Observable<TransactionDto> {
    return this.http.get<TransactionDto>(`${environment.apiUrl}/accounting-transaction/view/${id}`);
  }

  listTransactions(filterType: string): Observable<TransactionDto[]> {
    return this.http.get<TransactionDto[]>(`${environment.apiUrl}/accounting-transaction/index`, {
      params: { 'filter[type]': filterType },
    });
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/accounting-transaction/delete/${id}`);
  }
}

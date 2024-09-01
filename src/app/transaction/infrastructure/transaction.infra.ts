import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '@environment';
import {CreateTransaction, CreateTransactionDto, Transaction, TransactionDto} from '../entity/transaction.entity';
import {IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {ApiService} from '@shared/service/api.service';
import {toCamelCase} from '@shared/entity/utility.entity';

export class TransactionInfra {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);

  createTransaction(transaction: CreateTransaction): Observable<ServerResponse<TransactionDto>> {
    const dto: CreateTransactionDto = {
      transaction_date: transaction.transactionDate,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      entity_name: transaction.entityName,
      reference_number: transaction.referenceNumber,
      description: transaction.description,
      payment_method: transaction.paymentMethod,
    }
    return this.http.post<ServerResponse<TransactionDto>>(`${environment.apiUrl}/accounting-transaction/create`, dto);
  }

  updateTransaction(id: number, transaction: CreateTransaction): Observable<ServerResponse<TransactionDto>> {
    const dto: CreateTransactionDto = {
      transaction_date: transaction.transactionDate,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      entity_name: transaction.entityName,
      reference_number: transaction.referenceNumber,
      description: transaction.description,
      payment_method: transaction.paymentMethod,
    }
    return this.http.post<ServerResponse<TransactionDto>>(`${environment.apiUrl}/accounting-transaction/update/${id}`, dto);
  }

  viewTransaction(id: number): Observable<ServerResponse<TransactionDto>> {
    return this.http.get<ServerResponse<TransactionDto>>(`${environment.apiUrl}/accounting-transaction/view/${id}`);
  }

  fetchTransactions(pageIndex: number = 1): Observable<IndexResponse<Transaction>> {
    return this.apiService.fetchEntities<TransactionDto, Transaction>(
      'accounting-transaction/index',
      toCamelCase,
      pageIndex,
      '',
      [],
      100,
      ''
    );
  }

  deleteTransaction(id: number): Observable<ServerResponse<void>> {
    return this.http.delete<ServerResponse<void>>(`${environment.apiUrl}/accounting-transaction/delete/${id}`);
  }
}

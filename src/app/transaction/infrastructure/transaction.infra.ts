import { Observable } from 'rxjs';
import { CreateTransactionDto, mapTransactionDto, Transaction, TransactionDto } from '../entity/transaction.entity';
import { IndexResponse } from '@shared/entity/server-response.entity';
import { BaseInfra } from '@shared/service/base.infra';
import { Injectable } from '@angular/core';
import { FilterIndex } from '@shared/entity/common.entity';

@Injectable({
  providedIn: 'root'
})
export class TransactionInfra extends BaseInfra {
  private readonly endpoint = 'accounting-transaction';

  createTransaction(transaction: CreateTransactionDto): Observable<Transaction> {
    return this.createEntity<CreateTransactionDto, TransactionDto, Transaction>(
      this.endpoint,
      transaction,
      mapTransactionDto
    );
  }

  updateTransaction(id: number, transaction: CreateTransactionDto): Observable<Transaction> {
    return this.updateEntity<CreateTransactionDto, TransactionDto, Transaction>(
      this.endpoint,
      id,
      transaction,
      mapTransactionDto
    );
  }

  fetchTransactions(
    pageIndex: number = 1,
    filters?: FilterIndex<TransactionDto>[],
    sort: string = '-transaction_date'
  ): Observable<IndexResponse<Transaction>> {
    return this.fetchEntities<TransactionDto, Transaction>(this.endpoint, mapTransactionDto, pageIndex, filters, sort);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.deleteEntity(this.endpoint, id);
  }
}

import {inject} from '@angular/core';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {CreateTransaction, Transaction} from '../entity/transaction.entity';
import {TransactionInfra} from '../infrastructure/transaction.infra';
import {IndexResponse, ServerResponseError} from '@shared/entity/server-response.entity';
import {NzMessageService} from 'ng-zorro-antd/message';

export class TransactionFacade {
  private readonly transactionInfra = inject(TransactionInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly transactionSubject = new BehaviorSubject<Transaction | null>(null);
  private readonly transactionsIndexSubject = new BehaviorSubject<IndexResponse<Transaction> | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly transaction$ = this.transactionSubject.asObservable();
  readonly transactions$ = this.transactionsIndexSubject.asObservable();

  async createTransaction(transaction: CreateTransaction): Promise<void> {
    await firstValueFrom(this.transactionInfra.createTransaction(transaction));
    // Optionally fetch and update state.
  }

  async updateTransaction(id: number, transaction: CreateTransaction): Promise<void> {
    await firstValueFrom(this.transactionInfra.updateTransaction(id, transaction));
    // Optionally fetch and update state.
  }

  async loadTransactions(filterType: string): Promise<void> {
    this.loadingSubject.next(true)
    try {
      const response = await firstValueFrom(this.transactionInfra.fetchTransactions());
      this.transactionsIndexSubject.next(response);
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    await firstValueFrom(this.transactionInfra.deleteTransaction(id));
    // Optionally fetch and update state.
  }
}

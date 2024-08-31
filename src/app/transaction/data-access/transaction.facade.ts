import {inject} from '@angular/core';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {mapTransactionDTOtoTransaction, Transaction, TransactionDto} from '../entity/transaction.entity';
import {TransactionInfra} from '../infrastructure/transaction.infra';

export class TransactionFacade {
  private readonly transactionInfra = inject(TransactionInfra);
  private readonly transactionSubject = new BehaviorSubject<Transaction | null>(null);
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);

  readonly transaction$ = this.transactionSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();

  async createTransaction(transaction: TransactionDto): Promise<void> {
    await firstValueFrom(this.transactionInfra.createTransaction(transaction));
    // Optionally fetch and update state.
  }

  async updateTransaction(id: number, transaction: TransactionDto): Promise<void> {
    await firstValueFrom(this.transactionInfra.updateTransaction(id, transaction));
    // Optionally fetch and update state.
  }

  async loadTransaction(id: number): Promise<void> {
    const transactionDTO = await firstValueFrom(this.transactionInfra.viewTransaction(id));
    this.transactionSubject.next(mapTransactionDTOtoTransaction(transactionDTO));
  }

  async loadTransactions(filterType: string): Promise<void> {
    const transactionDTOs = await firstValueFrom(this.transactionInfra.listTransactions(filterType));
    const transactions = transactionDTOs.map(mapTransactionDTOtoTransaction);
    this.transactionsSubject.next(transactions);
  }

  async deleteTransaction(id: number): Promise<void> {
    await firstValueFrom(this.transactionInfra.deleteTransaction(id));
    // Optionally fetch and update state.
  }
}

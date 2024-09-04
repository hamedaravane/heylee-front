import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {CreateTransaction, CreateTransactionDto, Transaction} from '../entity/transaction.entity';
import {TransactionInfra} from '../infrastructure/transaction.infra';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {BaseFacade} from "@shared/service/base.facade";
import {toSnakeCase} from "@shared/entity/utility.entity";

@Injectable({
  providedIn: 'root'
})
export class TransactionFacade extends BaseFacade {
  private readonly transactionInfra = inject(TransactionInfra);
  private readonly transactionSubject = new BehaviorSubject<Transaction | null>(null);
  private readonly transactionsIndexSubject = new BehaviorSubject<IndexResponse<Transaction> | null>(null);

  get transaction$() {
    return this.transactionSubject.asObservable();
  }

  get transactionsIndex$() {
    return this.transactionsIndexSubject.asObservable();
  }

  async createTransaction(transaction: CreateTransaction): Promise<void> {
    const dto: CreateTransactionDto = toSnakeCase(transaction);
    await this.loadEntity(
      this.transactionSubject,
      () => firstValueFrom(this.transactionInfra.createTransaction(dto)),
      () => this.loadTransactions()
    )
  }

  async updateTransaction(id: number, transaction: CreateTransaction): Promise<void> {
    const dto: CreateTransactionDto = toSnakeCase(transaction);
    await this.loadEntity(
      this.transactionSubject,
      () => firstValueFrom(this.transactionInfra.updateTransaction(id, dto)),
      () => this.loadTransactions()
    )
  }

  async loadTransactions(pageIndex: number = 1): Promise<void> {
    await this.loadEntity(
      this.transactionsIndexSubject,
      () => firstValueFrom(this.transactionInfra.fetchTransactions(pageIndex)),
      undefined,
      true
    )
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.deleteEntity(
      () => firstValueFrom(this.transactionInfra.deleteTransaction(id)),
      () => this.loadTransactions()
    )
  }
}

import {Component, inject} from '@angular/core';
import {TransactionFacade} from '../data-access/transaction.facade';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CreateTransaction} from '../entity/transaction.entity';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  standalone: true,
})
export class TransactionComponent {
  private readonly transactionFacade = inject(TransactionFacade);

  transactionForm = new FormGroup({
    transactionDate: new FormControl(),
    type: new FormControl<string>(''),
    category: new FormControl<string>(''),
    amount: new FormControl<number | null>(null, Validators.required),
    entityName: new FormControl<string>(''),
    referenceNumber: new FormControl<string>(''),
    description: new FormControl<string | null>(null),
    paymentMethod: new FormControl<string | null>(null),
  });

  createTransaction(transaction: CreateTransaction): void {
    this.transactionFacade.createTransaction(transaction);
  }

  updateTransaction(id: number, transaction: CreateTransaction): void {
    this.transactionFacade.updateTransaction(id, transaction);
  }

  loadTransaction(id: number): void {
    this.transactionFacade.(id);
  }
}
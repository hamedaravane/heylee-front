import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {TransactionFacade} from '../data-access/transaction.facade';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {NzButtonModule} from "ng-zorro-antd/button";
import {AsyncPipe, DatePipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NzPaginationModule} from "ng-zorro-antd/pagination";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {NzFormModule} from "ng-zorro-antd/form";
import {BidiModule} from "@angular/cdk/bidi";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzUploadModule} from "ng-zorro-antd/upload";
import {RouterLink} from "@angular/router";
import {CreateTransaction, Transaction} from "../entity/transaction.entity";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {NzRadioModule} from "ng-zorro-antd/radio";
import {NzSelectModule} from "ng-zorro-antd/select";
import {distinctUntilChanged, map} from "rxjs";
import {PersianDatePipe} from "@shared/pipe/persian-date.pipe";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    BidiModule,
    NzDrawerModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzUploadModule,
    NzDividerModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzButtonModule,
    NzPaginationModule,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    DecimalPipe,
    PageContainerComponent,
    CardContainerComponent,
    NgTemplateOutlet,
    NzDatePickerModule,
    NzRadioModule,
    DatePipe,
    NzSelectModule,
    PersianDatePipe,
    CurrencyComponent,
  ]
})
export class TransactionComponent implements OnInit {
  private readonly transactionFacade = inject(TransactionFacade);
  private readonly destroyRef = inject(DestroyRef);
  transactionsIndex$ = this.transactionFacade.transactionsIndex$;
  isAddTransactionVisible = false;
  isEditTransactionVisible = false;
  selectedIdToEdit: number | null = null;
  loadingState = false;
  transactionForm = new FormGroup({
    transactionDate: new FormControl<string | null>(null, Validators.required),
    type: new FormControl<string | null>(null, Validators.required),
    category: new FormControl<string | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, Validators.required),
    entityName: new FormControl<string | null>(null, Validators.required),
    referenceNumber: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null),
    paymentMethod: new FormControl<string | null>(null, Validators.required),
  });

  ngOnInit(): void {
    this.transactionFacade.loadTransactions().then();
    this.transactionFacade.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loading => this.loadingState = loading)
    this.transactionForm.controls.transactionDate.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged(),
      map((value) => {
        if (!value) return null;
        return new Date(value).toISOString().split('T')[0];
      })).subscribe(value => this.transactionForm.controls.transactionDate.setValue(value, {emitEvent: false}))
  }

  pageIndexChange(pageIndex: number): void {
    this.transactionFacade.loadTransactions(pageIndex).then();
  }

  handleEditTransaction(transaction: Transaction) {
    this.selectedIdToEdit = transaction.id;
    this.isEditTransactionVisible = true;
    this.transactionForm.patchValue(transaction);
  }

  editTransaction() {
    if (this.selectedIdToEdit) {
      const form: CreateTransaction = this.transactionForm.getRawValue() as CreateTransaction;
      this.transactionFacade.updateTransaction(this.selectedIdToEdit, form).then(() => {
        this.closeTransactionFormDrawer();
        this.transactionForm.reset();
      });
    }
  }

  createTransaction() {
    const form: CreateTransaction = this.transactionForm.getRawValue() as CreateTransaction;
    this.transactionFacade.createTransaction(form).then(() => {
      this.closeTransactionFormDrawer();
      this.transactionForm.reset();
    });
  }

  deleteTransaction(id: number) {
    this.transactionFacade.deleteTransaction(id).then(() => {
      this.closeTransactionFormDrawer();
      this.transactionForm.reset();
    });
  }

  closeTransactionFormDrawer() {
    this.transactionForm.reset();
    this.isAddTransactionVisible = false;
    this.isEditTransactionVisible = false;
  }
}

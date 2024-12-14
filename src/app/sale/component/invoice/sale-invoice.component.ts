import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BidiModule } from '@angular/cdk/bidi';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SaleFacade } from '../../data-access/sale.facade';
import { AsyncPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ProductFilterPipe } from '../../pipe/product-filter.pipe';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { Customer } from '@customer/entity/customer.entity';
import { CreateUpdateInvoice, InvoiceItem, SaleInvoice } from '@sale/entity/invoice.entity';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { selectedProductToInvoiceItem } from '@inventory/entity/inventory.entity';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ProductImageContainerComponent } from '@shared/component/product-image-container/product-image-container.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ReceiptService } from '@shared/service/receipt-service';
import { ReceiptComponent } from '@shared/component/receipt/receipt.component';
import { CustomerFormComponent } from '@customer/component/customer-from/customer-form.component';
import { SelectedItemsComponent } from '@inventory/component/selected-items/selected-items.component';
import { AvailableItemsComponent } from '@inventory/component/available-items/available-items.component';
import { SelectionFacade } from '@inventory/data-access/selection.facade';

@Component({
  selector: 'sale-invoice',
  imports: [
    NzButtonModule,
    NzAutocompleteModule,
    NzSegmentedModule,
    ReactiveFormsModule,
    NzCollapseModule,
    NzEmptyModule,
    NzFormModule,
    NzInputModule,
    BidiModule,
    NzDividerModule,
    FormsModule,
    DecimalPipe,
    ProductFilterPipe,
    NgTemplateOutlet,
    NzAlertModule,
    NzSelectModule,
    NzRadioModule,
    NzModalModule,
    CardContainerComponent,
    PageContainerComponent,
    CurrencyComponent,
    ProductImageContainerComponent,
    ReceiptComponent,
    CustomerFormComponent,
    SelectedItemsComponent,
    AvailableItemsComponent,
    AsyncPipe
  ],
  standalone: true,
  providers: [ReceiptService, SelectionFacade],
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef<HTMLDivElement>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly selectionFacade = inject(SelectionFacade);
  private readonly receiptService = inject(ReceiptService);
  private readonly router = inject(Router);

  invoiceToUpdate: SaleInvoice | null = null;
  loading = toSignal(this.saleFacade.loading$, { initialValue: false });
  paymentStatusOptions = ['paid', 'unpaid', 'partially-paid'];
  shippingStatusOptions = ['shipped', 'canceled', 'ready-to-ship', 'on-hold'];
  isPreviewReceiptModalVisible = signal(false);
  saleInvoiceForm = new FormGroup({
    customerId: new FormControl<number>(NaN, { nonNullable: true, validators: Validators.required }),
    city: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    address: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl<string>({ value: '', disabled: false }, [Validators.nullValidator]),
    paymentStatus: new FormControl<'paid' | 'unpaid' | 'partially-paid'>('paid', {
      nonNullable: true,
      validators: Validators.required
    }),
    shippingStatus: new FormControl<'shipped' | 'canceled' | 'ready-to-ship' | 'on-hold'>('ready-to-ship', {
      nonNullable: true,
      validators: Validators.required
    }),
    shippingPrice: new FormControl<number>(500_000, { nonNullable: true, validators: Validators.required }),
    discount: new FormControl<number>(0, { nonNullable: true, validators: Validators.min(0) }),
    refNumber: new FormControl<string>(''),
    items: new FormControl<InvoiceItem[]>([], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)]
    })
  });
  totalOrderPrice = signal(0);
  totalItemsOrdered = signal(0);
  discount = signal(0);
  shippingPrice = signal(500_000);
  customerPayment = computed(() => this.totalOrderPrice() + this.shippingPrice() - this.discount());
  isCustomerFormValid = false;
  customerFormValue: Customer | null = null;

  constructor() {
    this.checkUpdateMode();
  }

  ngOnInit() {
    if (this.invoiceToUpdate) {
      this.handleCustomerForm(this.invoiceToUpdate.customer);
      this.saleInvoiceForm.patchValue({
        customerId: this.invoiceToUpdate.customerId,
        city: this.invoiceToUpdate.city,
        address: this.invoiceToUpdate.address,
        description: this.invoiceToUpdate.description,
        paymentStatus: this.invoiceToUpdate.paymentStatus as 'paid' | 'unpaid' | 'partially-paid',
        shippingStatus: this.invoiceToUpdate.shippingStatus as 'shipped' | 'canceled' | 'ready-to-ship' | 'on-hold',
        shippingPrice: this.invoiceToUpdate.shippingPrice,
        discount: this.invoiceToUpdate.discount,
        refNumber: this.invoiceToUpdate.refNumber,
        items: this.invoiceToUpdate.salesItem
      });
      this.selectionFacade.selectedItems$ = this.invoiceToUpdate.salesItem;
    }
    this.selectionFacade.selectedItems$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.saleInvoiceForm.controls.items.setValue(value.map(selectedProductToInvoiceItem));
      this.totalItemsOrdered.set(value.reduce((acc, curr) => acc + curr.selectedQuantity, 0));
      this.totalOrderPrice.set(value.reduce((acc, curr) => acc + curr.sellingUnitPrice, 0));
    });
    this.saleInvoiceForm.controls.shippingPrice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.shippingPrice.set(value));
    this.saleInvoiceForm.controls.discount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.discount.set(value));
  }

  updateInvoice() {
    if (this.saleInvoiceForm.valid && this.invoiceToUpdate?.id) {
      this.saleFacade.updateSaleInvoice(this.invoiceToUpdate.id, this.extractDataFromInvoiceForm()).then();
    }
  }

  async previewReceipt() {
    const element = this.receipt.nativeElement;
    await this.receiptService.shareReceipt(element);
    this.isPreviewReceiptModalVisible.set(false);
  }

  submitOrderForm() {
    if (this.saleInvoiceForm.valid) {
      this.saleFacade.createSaleInvoice(this.extractDataFromInvoiceForm()).then(() => {
        this.saleInvoiceForm.reset();
      });
    }
  }

  private extractDataFromInvoiceForm(): CreateUpdateInvoice {
    const rawValues = this.saleInvoiceForm.getRawValue();
    return {
      customerId: rawValues.customerId,
      city: rawValues.city,
      address: rawValues.address,
      description: rawValues.description,
      paymentStatus: rawValues.paymentStatus,
      shippingStatus: rawValues.shippingStatus,
      shippingPrice: rawValues.shippingPrice,
      discount: rawValues.discount,
      refNumber: rawValues.refNumber,
      items: rawValues.items
    } as CreateUpdateInvoice;
  }

  private checkUpdateMode() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.invoiceToUpdate = navigation.extras.state['invoice'];
    }
  }

  private onPaymentStatusChange() {
    this.saleInvoiceForm.controls.paymentStatus.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(paymentStatus => {
        switch (paymentStatus) {
          case 'paid':
            this.saleInvoiceForm.controls.refNumber.addValidators(Validators.required);
            this.saleInvoiceForm.markAsDirty({ emitEvent: true });
            break;
          case 'partially-paid':
            this.saleInvoiceForm.controls.refNumber.addValidators(Validators.required);
            this.saleInvoiceForm.markAsDirty({ emitEvent: true });
            break;
          case 'unpaid':
            this.saleInvoiceForm.controls.refNumber.clearValidators();
            this.saleInvoiceForm.markAsDirty({ emitEvent: true });
            break;
        }
      });
  }

  handleCustomerForm($event: Customer) {
    this.customerFormValue = $event;
    this.saleInvoiceForm.controls.customerId.setValue($event.id);
    this.saleInvoiceForm.controls.city.setValue($event.city);
    this.saleInvoiceForm.controls.address.setValue($event.address);
  }
}

import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BidiModule } from '@angular/cdk/bidi';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SaleFacade } from '../../data-access/sale.facade';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ProductFilterPipe } from '../../pipe/product-filter.pipe';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { Customer, CustomerDto } from '@customer/entity/customer.entity';
import { CustomerApi } from '@customer/api/customer.api';
import { InventoryApi } from '@inventory/api/inventory.api';
import {
  CreateUpdateInvoice,
  InvoiceItem,
  SaleInvoice,
  salesItemToStockItemSelection
} from '@sale/entity/invoice.entity';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { debounceTime, distinctUntilChanged, filter, of } from 'rxjs';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { selectedProductToInvoiceItem, StockItemSelection } from '@inventory/entity/inventory.entity';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ProductImageContainerComponent } from '@shared/component/product-image-container/product-image-container.component';
import { FilterIndex } from '@shared/entity/common.entity';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ReceiptService } from '@shared/service/receipt-service';
import { ReceiptComponent } from '@shared/component/receipt/receipt.component';

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
    ReceiptComponent
  ],
  standalone: true,
  providers: [ReceiptService],
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLImageElement>;
  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerApi = inject(CustomerApi);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly receiptService = inject(ReceiptService);
  private readonly router = inject(Router);
  protected readonly Validators = Validators;

  constructor() {
    this.checkUpdateMode();
  }

  invoiceToUpdate: SaleInvoice | null = null;
  loading = toSignal(this.saleFacade.loading$, { initialValue: false });
  paymentStatusOptions = ['paid', 'unpaid', 'partially-paid'];
  shippingStatusOptions = ['shipped', 'canceled', 'ready-to-ship', 'on-hold'];
  customers: Customer[] | null = null;
  searchText = '';
  availableProducts: StockItemSelection[] = [];
  selectedProducts: StockItemSelection[] = [];
  totalOrderPrice = signal(0);
  totalItemsOrdered = signal(0);
  customerPayment = computed(() => this.totalOrderPrice() + this.shippingPrice() - this.discount());
  shippingPrice = signal(0);
  discount = signal(0);
  isPreviewReceiptModalVisible = signal(false);
  saleInvoiceForm = new FormGroup({
    customerId: new FormControl<number | null>(null, Validators.required),
    city: new FormControl<string | null>(null, Validators.required),
    address: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null),
    paymentStatus: new FormControl<'paid' | 'unpaid' | 'partially-paid'>('paid', Validators.required),
    shippingStatus: new FormControl<'shipped' | 'canceled' | 'ready-to-ship' | 'on-hold'>(
      'ready-to-ship',
      Validators.required
    ),
    shippingPrice: new FormControl<number | null>(null, Validators.required),
    discount: new FormControl<number | null>(0, [Validators.min(0)]),
    refNumber: new FormControl<string | null>(null),
    items: new FormControl<InvoiceItem[] | null>(null, Validators.required)
  });
  customerForm = new FormGroup({
    name: new FormControl<string | null>(null, Validators.required),
    phone: new FormControl<string | null>(null, Validators.required),
    postalCode: new FormControl<string | null>(null),
    telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
    instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
    cityCustomer: new FormControl<string | null>(null, Validators.required),
    addressCustomer: new FormControl<string | null>(null, Validators.required)
  });

  ngOnInit() {
    this.loadCustomers().then();
    this.inventoryApi.availableProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(items => {
      this.fillFormsToUpdate();
      this.availableProducts = items.map(item => {
        return {
          ...item,
          selectedQuantity: 0
        };
      });
    });
    this.setupFormListeners();
    this.fillFormsToUpdate();
  }

  private async loadCustomers() {
    await this.customerApi.loadCustomers();
    this.customerApi.customers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(customers => (this.customers = customers.items));
  }

  onPhoneSearch(e: string) {
    of(e)
      .pipe(debounceTime(2000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const filter: FilterIndex<CustomerDto>[] = [{ prop: 'phone', operator: 'like', value: e }];
        this.customerApi.loadCustomers(1, filter).then();
      });
  }

  addItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0 || quantity > item.availableQuantity) return;

    this.updateArrays(this.availableProducts, this.selectedProducts, item, quantity);

    const selectedIndex = this.findItemIndex(this.selectedProducts, item);
    if (selectedIndex !== -1) {
      this.selectedProducts[selectedIndex].selectedQuantity += quantity;
    }
    this.updateItemsControl();
  }

  removeItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0 || quantity > item.selectedQuantity) return;

    this.updateArrays(this.selectedProducts, this.availableProducts, item, quantity);

    const selectedIndex = this.findItemIndex(this.selectedProducts, item);
    if (selectedIndex !== -1) {
      this.selectedProducts[selectedIndex].selectedQuantity -= quantity;
      if (this.selectedProducts[selectedIndex].selectedQuantity <= 0) {
        this.selectedProducts.splice(selectedIndex, 1);
      }
    }
    this.updateItemsControl();
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
        this.customerForm.reset();
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

  private findItemIndex(array: StockItemSelection[], item: StockItemSelection): number {
    return array.findIndex(
      i => i.product.id === item.product.id && i.color.id === item.color.id && i.size.id === item.size.id
    );
  }

  private updateItemsControl(): void {
    this.saleInvoiceForm.controls.items.setValue(this.selectedProducts.map(item => selectedProductToInvoiceItem(item)));
  }

  private updateArrays(
    sourceArray: StockItemSelection[],
    targetArray: StockItemSelection[],
    item: StockItemSelection,
    quantity: number
  ): void {
    const sourceIndex = this.findItemIndex(sourceArray, item);
    const targetIndex = this.findItemIndex(targetArray, item);

    if (sourceIndex !== -1) {
      const sourceItem = sourceArray[sourceIndex];
      sourceItem.availableQuantity -= quantity;

      if (sourceItem.availableQuantity <= 0) {
        sourceArray.splice(sourceIndex, 1);
      }
    }

    if (targetIndex !== -1) {
      const targetItem = targetArray[targetIndex];
      targetItem.availableQuantity += quantity;
    } else {
      const newItem: StockItemSelection = {
        ...item,
        availableQuantity: quantity
      };
      targetArray.push(newItem);
    }
  }

  private fillFormsToUpdate() {
    if (this.invoiceToUpdate) {
      this.customerForm.setValue({
        name: this.invoiceToUpdate.customer.name,
        phone: this.invoiceToUpdate.customer.phone,
        postalCode: this.invoiceToUpdate.customer.postalCode,
        telegram: this.invoiceToUpdate.customer.telegram,
        instagram: this.invoiceToUpdate.customer.instagram,
        cityCustomer: this.invoiceToUpdate.customer.city,
        addressCustomer: this.invoiceToUpdate.customer.address
      });
      this.customerForm.disable();
      this.saleInvoiceForm.setValue({
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
      this.selectedProducts = this.invoiceToUpdate.salesItem.map(salesItemToStockItemSelection);
      this.updateItemsControl();
    }
  }

  private checkUpdateMode() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.invoiceToUpdate = navigation.extras.state['invoice'];
    }
  }

  private setupFormListeners(): void {
    this.onPhoneControlChange();
    this.onShippingPriceChange();
    this.onDiscountControlChange();
    this.onItemsControlChange();
    // this.onPaymentStatusChange();
  }

  private onPhoneControlChange() {
    this.customerForm.controls.phone.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe(phoneValue => {
        const customer = this.customers?.find(c => c.phone === phoneValue);
        if (customer) {
          this.saleInvoiceForm.controls.customerId.setValue(customer.id);
          this.customerForm.setValue({
            name: customer.name,
            phone: customer.phone,
            postalCode: customer.postalCode,
            telegram: customer.telegram,
            instagram: customer.instagram,
            cityCustomer: customer.city,
            addressCustomer: customer.address
          });
          this.saleInvoiceForm.controls.city.setValue(customer.city);
          this.saleInvoiceForm.controls.address.setValue(customer.address);
          this.customerForm.disable();
          this.customerForm.controls.phone.enable();
        }
      });
  }

  private onItemsControlChange() {
    this.saleInvoiceForm.controls.items.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe(items => {
        this.totalItemsOrdered.set(items.reduce((acc, curr) => acc + curr.quantity, 0));
        const totalOrdersPrice = items.reduce((acc, curr) => {
          const stockItem = this.selectedProducts.find(
            s => s.product.id === curr.productId && s.color.id === curr.colorId && s.size.id === curr.sizeId
          );
          if (stockItem) {
            return acc + curr.quantity * stockItem.sellingUnitPrice;
          } else {
            throw new Error('Product not found');
          }
        }, 0);
        this.totalOrderPrice.set(totalOrdersPrice);
      });
  }

  private onDiscountControlChange() {
    this.saleInvoiceForm.controls.discount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe(discount => {
        this.discount.set(discount);
      });
  }

  private onShippingPriceChange() {
    this.saleInvoiceForm.controls.shippingPrice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe(shippingPrice => {
        this.shippingPrice.set(shippingPrice);
      });
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
}

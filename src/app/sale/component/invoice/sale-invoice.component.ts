import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SaleFacade} from '../../data-access/sale.facade';
import {AsyncPipe, DecimalPipe, NgTemplateOutlet} from '@angular/common';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {ProductFilterPipe} from '../../pipe/product-filter.pipe';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {Customer} from '@customer/entity/customer.entity';
import {CustomerApi} from '@customer/api/customer.api';
import {InventoryApi} from '@inventory/api/inventory.api';
import {
  CreateUpdateInvoice,
  InvoiceItem,
  SaleInvoice,
  salesItemToStockItemSelection
} from '@sale/entity/invoice.entity';
import {CurrencyComponent} from '@shared/component/currency-wrapper/currency.component';
import {distinctUntilChanged, filter} from 'rxjs';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {NzSegmentedModule} from 'ng-zorro-antd/segmented';
import {selectedProductToInvoiceItem, StockItemSelection} from '@inventory/entity/inventory.entity';
import {Router} from '@angular/router';

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, NzAutocompleteModule, NzSegmentedModule, ReactiveFormsModule, NzCollapseModule,
    NzEmptyModule, NzFormModule, NzInputModule, BidiModule, NzDividerModule, AsyncPipe, FormsModule,
    DecimalPipe, ProductFilterPipe, NgTemplateOutlet, CardContainerComponent, PageContainerComponent, CurrencyComponent],
  standalone: true,
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerApi = inject(CustomerApi);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly router = inject(Router);

  constructor() {
    this.checkUpdateMode();
  }

  invoiceToUpdate: SaleInvoice | null = null;
  loading$ = this.saleFacade.loading$;
  paymentStatusOptions = ['paid', 'unpaid'];
  shippingStatusOptions = ['shipped', 'canceled', 'ready-to-ship'];
  customers: Customer[] | null = null;
  searchText = '';
  availableProducts: StockItemSelection[] = [];
  selectedProducts: StockItemSelection[] = [];
  totalOrderPrice = signal(0);
  totalItemsOrdered = signal(0);
  customerPayment = computed(() => this.totalOrderPrice() + this.shippingPrice() - this.discount())
  shippingPrice = signal(0);
  discount = signal(0);

  saleInvoiceForm = new FormGroup({
    customerId: new FormControl<number | null>(null, Validators.required),
    city: new FormControl<string>('', Validators.required),
    address: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('', Validators.required),
    paymentStatus: new FormControl<'paid' | 'unpaid'>('paid'),
    shippingStatus: new FormControl<'shipped' | 'canceled' | 'ready-to-ship'>('ready-to-ship'),
    shippingPrice: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    refNumber: new FormControl<string>('', Validators.required),
    items: new FormControl<InvoiceItem[]>([], Validators.minLength(1)),
  });

  customerForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    phone: new FormControl<string>('', Validators.required),
    postalCode: new FormControl<string | null>(null),
    telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
    instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
    cityCustomer: new FormControl<string>('', Validators.required),
    addressCustomer: new FormControl<string>('', Validators.required),
  });

  private nameControl = this.customerForm.controls.name;
  private phoneControl = this.customerForm.controls.phone;
  private postalCodeControl = this.customerForm.controls.postalCode;
  private telegramControl = this.customerForm.controls.telegram;
  private instagramControl = this.customerForm.controls.instagram;
  private cityCustomerControl = this.customerForm.controls.cityCustomer;
  private addressCustomerControl = this.customerForm.controls.addressCustomer;

  customerIdControl = this.saleInvoiceForm.controls.customerId;
  private cityControl = this.saleInvoiceForm.controls.city;
  private addressControl = this.saleInvoiceForm.controls.address;
  private shippingPriceControl = this.saleInvoiceForm.controls.shippingPrice as FormControl<number>;
  private discountControl = this.saleInvoiceForm.controls.discount as FormControl<number>;
  private itemsControl = this.saleInvoiceForm.controls.items as FormControl<InvoiceItem[]>;

  ngOnInit() {
    this.customerApi.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((customers) => this.customers = customers.items);
    this.customers?.push({
      name: '',
      phone: '',
      postalCode: null,
      telegram: null,
      instagram: null,
      city: '',
      address: '',
      createdAt: '',
      id: 999
    })
    this.inventoryApi.availableProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.fillFormsToUpdate();
      this.availableProducts = items.map((item) => {
        return {
          ...item,
          selectedQuantity: 0
        }
      });
    })
    this.setupFormListeners();
    this.fillFormsToUpdate();
  }

  addItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0 || quantity > item.availableQuantity) return;

    this.updateArrays(
      this.availableProducts,
      this.selectedProducts,
      item,
      quantity
    );

    const selectedIndex = this.findItemIndex(this.selectedProducts, item);
    if (selectedIndex !== -1) {
      this.selectedProducts[selectedIndex].selectedQuantity += quantity;
    }
    this.updateItemsControl();
  }

  removeItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0 || quantity > item.selectedQuantity) return;

    this.updateArrays(
      this.selectedProducts,
      this.availableProducts,
      item,
      quantity
    );

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
      items: rawValues.items,
    } as CreateUpdateInvoice;
  }

  createNewCustomer() {
    const customer = {
      name: this.nameControl.value as string,
      phone: this.phoneControl.value as string,
      address: this.addressControl.value || this.addressCustomerControl.value as string,
      city: this.cityControl.value || this.cityCustomerControl.value as string,
      postalCode: this.postalCodeControl.value,
      instagram: this.instagramControl.value,
      telegram: this.telegramControl.value,
    };
    this.customerApi.createCustomer(customer).then((customer) => {
      this.customerIdControl.setValue(customer.id);
    }).then(() => this.submitOrderForm());
  }

  private findItemIndex(
    array: StockItemSelection[],
    item: StockItemSelection
  ): number {
    return array.findIndex(
      (i) =>
        i.product.id === item.product.id &&
        i.color.id === item.color.id &&
        i.size.id === item.size.id
    );
  }

  private updateItemsControl(): void {
    this.itemsControl.setValue(this.selectedProducts.map((item) => selectedProductToInvoiceItem(item)))
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
        availableQuantity: quantity,
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
        addressCustomer: this.invoiceToUpdate.customer.address,
      });
      this.customerForm.disable();
      this.saleInvoiceForm.setValue({
        customerId: this.invoiceToUpdate.customerId,
        city: this.invoiceToUpdate.city,
        address: this.invoiceToUpdate.address,
        description: this.invoiceToUpdate.description,
        paymentStatus: this.invoiceToUpdate.paymentStatus as 'paid' | 'unpaid',
        shippingStatus: this.invoiceToUpdate.shippingStatus as 'shipped' | 'canceled' | 'ready-to-ship',
        shippingPrice: this.invoiceToUpdate.shippingPrice,
        discount: this.invoiceToUpdate.discount,
        refNumber: this.invoiceToUpdate.refNumber,
        items: this.invoiceToUpdate.salesItem,
      });
      this.selectedProducts = this.invoiceToUpdate.salesItem.map(salesItemToStockItemSelection);
      this.updateItemsControl();
    }
  }

  private checkUpdateMode() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.invoiceToUpdate = navigation.extras.state['invoice'] as SaleInvoice;
    }
  }

  private setupFormListeners(): void {
    this.trackPhone();
    this.trackShippingPrice();
    this.trackDiscount();
    this.trackItems();
  }

  private trackPhone() {
    this.phoneControl.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe((phoneValue) => {
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
            addressCustomer: customer.address,
          })
          this.saleInvoiceForm.controls.city.setValue(customer.city);
          this.saleInvoiceForm.controls.address.setValue(customer.address);
          this.customerForm.disable();
          this.phoneControl.enable();
        }
      })
  }

  onPhoneInput(e: Event): void {
    const value = e.target as HTMLInputElement;
    this.customers ? this.customers[0].phone = value.value : null;
  }

  private trackItems() {
    this.itemsControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe((items) => {
        this.totalItemsOrdered.set(items.reduce((acc, curr) => acc + curr.quantity, 0));
        // TODO: it seems that this is not working as expected
        const totalOrdersPrice = items.reduce((acc, curr) => {
          const stockItem = this.selectedProducts.find(s => s.product.id === curr.productId && s.color.id === curr.colorId && s.size.id === curr.sizeId);
          if (stockItem) {
            return acc + curr.quantity * stockItem.sellingUnitPrice
          } else {
            throw new Error('Product not found');
          }
        }, 0);
        this.totalOrderPrice.set(totalOrdersPrice);
      });
  }

  private trackDiscount() {
    this.discountControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((discount) => {
      this.discount.set(discount);
    });
  }

  private trackShippingPrice() {
    this.shippingPriceControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((shippingPrice) => {
      this.shippingPrice.set(shippingPrice);
    });
  }
}

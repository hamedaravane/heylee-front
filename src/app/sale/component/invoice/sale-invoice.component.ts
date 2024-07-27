import {Component, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
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
import {StockItem} from '@inventory/entity/inventory.entity';
import {Customer} from '@customer/entity/customer.entity';
import {CustomerApi} from '@customer/api/customer.api';
import {InventoryApi} from '@inventory/api/inventory.api';
import {CreateUpdateInvoice, InvoiceItem} from '@sale/entity/invoice.entity';
import {CurrencyComponent} from '@shared/component/currency-wrapper/currency.component';
import {distinctUntilChanged, filter} from 'rxjs';
import {NzAutocompleteModule} from 'ng-zorro-antd/auto-complete';
import {NzSegmentedModule} from 'ng-zorro-antd/segmented';

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, NzAutocompleteModule, NzSegmentedModule, ReactiveFormsModule, NzCollapseModule,
    NzEmptyModule, NzFormModule, NzInputModule, BidiModule, NzDividerModule, AsyncPipe, FormsModule,
    DecimalPipe, ProductFilterPipe, NgTemplateOutlet, CardContainerComponent, PageContainerComponent, CurrencyComponent],
  standalone: true,
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  @Input() updateInvoice: boolean = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerApi = inject(CustomerApi);
  private readonly inventoryApi = inject(InventoryApi);
  loading$ = this.saleFacade.loading$;
  paymentStatusOptions = ['paid', 'unpaid'];
  shippingStatusOptions = ['shipped', 'canceled', 'ready-to-ship'];
  customers: Customer[] | null = null;
  customerId: number | null = null;
  searchText = '';
  availableProducts: StockItem[] = [];
  totalOrderPrice = signal(0);
  totalItemsOrdered = signal(0);
  customerPayment = signal(0);
  shippingPrice = signal(450_000);
  discount = signal(0);

  saleInvoiceForm = new FormGroup({
    customerId: new FormControl<number | null>(null, Validators.required),
    city: new FormControl<string>('', Validators.required),
    address: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('', Validators.required),
    paymentStatus: new FormControl<'paid' | 'unpaid'>({value: 'paid', disabled: true}),
    shippingStatus: new FormControl<'shipped' | 'canceled' | 'ready-to-ship'>({
      value: 'ready-to-ship',
      disabled: true
    }),
    shippingPrice: new FormControl<number>(450_000, Validators.required),
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
  private descriptionControl = this.saleInvoiceForm.controls.description;
  private paymentStatusControl = this.saleInvoiceForm.controls.paymentStatus;
  private shippingStatusControl = this.saleInvoiceForm.controls.shippingStatus;
  private shippingPriceControl = this.saleInvoiceForm.controls.shippingPrice as FormControl<number>;
  private discountControl = this.saleInvoiceForm.controls.discount as FormControl<number>;
  private refNumberControl = this.saleInvoiceForm.controls.refNumber;
  private itemsControl = this.saleInvoiceForm.controls.items as FormControl<InvoiceItem[]>;

  get selectedProducts() {
    return this.itemsControl.value.map(item => {
      return {
        ...item,
        detail: this.findProductById(item.productId)!
      }
    });
  }

  ngOnInit() {
    this.inventoryApi.availableProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => this.availableProducts = items)
    this.customerApi.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((customers) => this.customers = customers.items);
    this.shippingPriceControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((shippingPrice) => {
      this.shippingPrice.set(shippingPrice);
    });
    this.trackPhone();
    this.trackItems();
    this.trackDiscount();
  }

  submitOrderForm() {
    if (this.saleInvoiceForm.valid) {
      this.saleFacade.createSaleInvoice(this.saleInvoiceForm.getRawValue() as CreateUpdateInvoice).then();
    }
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

  trackPhone() {
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
        }
      })
  }

  trackItems() {
    this.itemsControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((items) => {
      this.totalItemsOrdered.set(items.reduce((acc, curr) => acc + curr.quantity, 0));
      this.totalOrderPrice.set(items.reduce((acc, curr) => {
        const stockItem = this.findProductById(curr.productId);
        if (stockItem) {
          return acc + curr.quantity * stockItem.sellingUnitPrice
        } else {
          throw new Error('Product not found');
        }
      }, 0));
      this.customerPayment.set(this.totalOrderPrice() + this.shippingPriceControl.value - this.discount());
    });
  }

  trackDiscount() {
    this.discountControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((discount) => {
      this.discount.set(discount);
      this.customerPayment.set(this.totalOrderPrice() + this.shippingPriceControl.value - this.discount());
    });
  }

  moveProductToOrder(stockItem: StockItem) {
    const newItem: InvoiceItem = {
      productId: stockItem.product.id,
      quantity: 1,
      sizeId: stockItem.size.id,
      colorId: stockItem.color.id,
    }
    const itemsControlSnapshot = this.itemsControl.value;
    this.itemsControl.setValue([...itemsControlSnapshot, newItem])
  }

  removeSelectedProduct(item: {
    detail: StockItem,
    productId: number,
    colorId: number,
    sizeId: number,
    quantity: number
  }) {
    this.itemsControl.setValue(this.itemsControl.value.filter(i => i.productId === item.productId && i.colorId === item.colorId && i.sizeId === item.sizeId));
  }

  private findProductById(id: number) {
    return this.availableProducts.find(p => p.product.id === id);
  }
}

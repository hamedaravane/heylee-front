import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
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
import {CreateUpdateInvoice} from '@sale/entity/invoice.entity';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerApi = inject(CustomerApi);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly constantPostFee = 450_000;
  loading$ = this.saleFacade.loading$;
  paymentStatusOptions = ['paid', 'unpaid'];
  shippingStatusOptions = ['shipped', 'canceled', 'ready-to-ship'];
  loadingState = false;
  customers: Customer[] | null = null;
  customerId: number | null = null;
  searchText = '';
  availableProducts: StockItem[] = [];
  selectedProducts: StockItem[] = [];
  totalOrderPrice = signal(0);
  postFee = signal(0);
  totalOrderQuantity = signal(0);
  orderFee = signal(0);
  discount = signal(0);

  saleInvoiceForm = new FormGroup({
    customerId: new FormControl<string>('', Validators.required),
    customer: new FormGroup({
      name: new FormControl<string>('', Validators.required),
      phone: new FormControl<string>('', Validators.required),
      postalCode: new FormControl<string | null>(null),
      telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
      instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
      cityCustomer: new FormControl<string>('', Validators.required),
      addressCustomer: new FormControl<string>('', Validators.required),
    }),
    city: new FormControl<string>('', Validators.required),
    address: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('', Validators.required),
    paymentStatus: new FormControl<'paid' | 'unpaid'>({value: 'paid', disabled: true}, Validators.required),
    shippingStatus: new FormControl<'shipped' | 'canceled' | 'ready-to-ship'>({value:'ready-to-ship', disabled: true}, Validators.required),
    shippingPrice: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    refNumber: new FormControl<string>('', Validators.required),
    items: new FormControl<StockItem[]>([], Validators.minLength(1)),
  });

  private customerIdControl = this.saleInvoiceForm.controls.customerId;
  private nameControl = this.saleInvoiceForm.controls.customer.controls.name;
  private phoneControl = this.saleInvoiceForm.controls.customer.controls.phone;
  private postalCodeControl = this.saleInvoiceForm.controls.customer.controls.postalCode;
  private telegramControl = this.saleInvoiceForm.controls.customer.controls.telegram;
  private instagramControl = this.saleInvoiceForm.controls.customer.controls.instagram;
  private cityCustomerControl = this.saleInvoiceForm.controls.customer.controls.cityCustomer;
  private addressCustomerControl = this.saleInvoiceForm.controls.customer.controls.addressCustomer;

  private cityControl = this.saleInvoiceForm.controls.city;
  private addressControl = this.saleInvoiceForm.controls.address;
  private descriptionControl = this.saleInvoiceForm.controls.description;
  private paymentStatusControl = this.saleInvoiceForm.controls.paymentStatus;
  private shippingStatusControl = this.saleInvoiceForm.controls.shippingStatus;
  private shippingPriceControl = this.saleInvoiceForm.controls.shippingPrice;
  private discountControl = this.saleInvoiceForm.controls.discount;
  private refNumberControl = this.saleInvoiceForm.controls.refNumber;
  private itemsControl = this.saleInvoiceForm.controls.items;

  ngOnInit() {
    this.inventoryApi.availableProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => this.availableProducts = items)
    this.customerApi.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((customers) => this.customers = customers.items);

    this.cityControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((city) => {
      this.postFee.set(city === 'مشهد' ? 0 : this.constantPostFee);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.discountControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((discount) => {
      this.discount.set(discount);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.itemsControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean)).subscribe((items) => {
      this.totalOrderQuantity.set(items.reduce((acc, curr) => acc + curr.availableQuantity, 0));
      this.totalOrderPrice.set(items.reduce((acc, curr) => acc + curr.sellingUnitPrice * curr.availableQuantity, 0));
      this.postFee.set(this.totalOrderPrice() > 7_000_000 ? 0 : this.postFee());
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });

    this.trackPhone();
  }

  trackPhone() {
    this.phoneControl.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe((phoneValue) => {
        const customer = this.customers?.find(c => c.phone === phoneValue);
          if (customer) {
            this.customerId = customer.id;
            this.saleInvoiceForm.controls.customer.setValue({
              name: customer.name,
              phone: customer.phone,
              postalCode: customer.postalCode,
              telegram: customer.telegram,
              instagram: customer.instagram,
              cityCustomer: customer.city,
              addressCustomer: customer.address,
            })
            this.disableCustomerControls();
          }
      })
  }

  disableCustomerControls() {
    this.nameControl.disable();
    this.cityControl.disable();
    this.addressControl.disable();
    this.postalCodeControl.disable();
    this.instagramControl.disable();
    this.telegramControl.disable();
  }

  createNewCustomer() {
    const customer = {
      name: this.nameControl.value as string,
      phone: this.phoneControl.value as string,
      address: this.addressControl.value as string,
      city: this.cityControl.value as string,
      postalCode: this.postalCodeControl.value,
      instagram: this.instagramControl.value,
      telegram: this.telegramControl.value,
    };
    this.customerApi.createCustomer(customer).then((customer) => {
      this.customerId = customer.id;
      this.submitOrderForm().then();
    });
  }

  async submitOrderForm() {
    try {
      const form = this.generateCreateInvoiceForm();
      await this.saleFacade.createSaleInvoice(form);
    } catch (e) {
      this.createNewCustomer();
    }
  }

  private generateCreateInvoiceForm(): CreateUpdateInvoice {
    if (this.customerId) {
      return {
        customerId: this.customerId,
        city: this.cityControl.value || '',
        address: this.addressControl.value || '',
        description: this.descriptionControl.value || '',
        paymentStatus: 'paid',
        shippingPrice: this.postFee(),
        shippingStatus: 'ready-to-ship',
        discount: this.discountControl.value || 0,
        items: this.itemsControl.value?.map((value) => {
          return {
            productId: value.product.id,
            colorId: value.color.id,
            sizeId: value.size.id,
            quantity: this.selectedProducts.find((p) => p.product.id === value.product.id)?.availableQuantity || 0
          }
        }) ?? []
      }
    } else {
      throw new Error('customerId is null');
    }
  }

  moveProductToOrder(product: StockItem) {
    const existingProductInSelected = this.selectedProducts.find(p => p.product.id === product.product.id);
    if (existingProductInSelected) {
      existingProductInSelected.availableQuantity++;
    } else {
      this.selectedProducts.push({...product, availableQuantity: 1});
    }
    product.availableQuantity--;
    if (product.availableQuantity === 0) {
      const indexToRemove = this.availableProducts.indexOf(product);
      if (indexToRemove > -1) {
        this.availableProducts = [
          ...this.availableProducts.slice(0, indexToRemove),
          ...this.availableProducts.slice(indexToRemove + 1)
        ];
      }
    }
    this.itemsControl?.setValue(this.selectedProducts);
  }

  removeSelectedProduct(product: StockItem) {
    const selectedProduct = this.selectedProducts.find(p => p.product.id === product.product.id);
    if (selectedProduct) {
      selectedProduct.availableQuantity--;

      if (selectedProduct.availableQuantity === 0) {
        this.selectedProducts = this.selectedProducts.filter(p => p.product.id !== product.product.id);
      }
      const availableProduct = this.availableProducts.find(p => p.product.id === product.product.id);
      if (availableProduct) {
        availableProduct.availableQuantity++;
      } else {
        this.availableProducts.push({...product, availableQuantity: 1});
      }
    }
    this.itemsControl?.setValue(this.selectedProducts);
  }
}

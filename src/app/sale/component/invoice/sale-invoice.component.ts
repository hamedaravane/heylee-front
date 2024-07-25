import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SaleFacade} from '../../data-access/sale.facade';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {ProductFilterPipe} from '../../pipe/product-filter.pipe';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {StockItem} from '@inventory/entity/inventory.entity';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {Customer} from '@customer/entity/customer.entity';
import {CustomerApi} from "@customer/api/customer.api";
import {InventoryApi} from "@inventory/api/inventory.api";
import {CreateUpdateInvoice} from "@sale/entity/invoice.entity";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";
import {distinctUntilChanged, filter} from "rxjs";

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, ReactiveFormsModule, NzCollapseModule, NzEmptyModule, NzFormModule, NzInputModule, BidiModule, NzDividerModule, AsyncPipe, NzSelectModule, FormsModule, NgOptimizedImage, DecimalPipe, ProductFilterPipe, NgTemplateOutlet, CardContainerComponent, PageContainerComponent, CurrencyComponent],
  standalone: true,
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerApi = inject(CustomerApi);
  private readonly inventoryApi = inject(InventoryApi);
  private readonly constantPostFee = 450_000;
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
    name: new FormControl<string>('', Validators.required),
    phone: new FormControl<string>('', Validators.required),
    city: new FormControl<string>('', Validators.required),
    postalCode: new FormControl<string | null>(null),
    address: new FormControl<string>('', Validators.required),
    instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
    refNumber: new FormControl<string>('', Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    description: new FormControl<string>('', Validators.required),
    items: new FormControl<StockItem[]>([], Validators.minLength(1))
  });

  private nameControl = this.saleInvoiceForm.controls.name;
  private phoneControl = this.saleInvoiceForm.controls.phone;
  private cityControl = this.saleInvoiceForm.controls.city;
  private addressControl = this.saleInvoiceForm.controls.address;
  private postalCodeControl = this.saleInvoiceForm.controls.postalCode;
  private instagramControl = this.saleInvoiceForm.controls.instagram;
  private telegramControl = this.saleInvoiceForm.controls.telegram;

  private descriptionControl = this.saleInvoiceForm.controls.description;
  private refNumberControl = this.saleInvoiceForm.controls.refNumber;

  private itemsControl = this.saleInvoiceForm.controls.items;
  private discountControl = this.saleInvoiceForm.controls.discount;

  ngOnInit() {
    this.inventoryApi.availableProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => this.availableProducts = items)
    this.customerApi.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((customers) => this.customers = customers.items);
    this.saleFacade.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.loadingState = value)

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
            this.saleInvoiceForm.setValue({
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              postalCode: customer.postalCode,
              city: customer.city,
              instagram: customer.instagram,
              telegram: customer.telegram,
              discount: this.discountControl.value,
              description: this.descriptionControl.value,
              refNumber: this.refNumberControl.value,
              items: this.itemsControl.value
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
      this.generateCreateInvoiceForm();
    });
  }

  async submitOrderForm() {
    const form = this.generateCreateInvoiceForm();
    await this.saleFacade.createSaleInvoice(form);
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

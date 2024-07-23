import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SaleFacade} from '../../data-access/sale.facade';
import {AsyncPipe, DecimalPipe, NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {NzCollapseModule} from 'ng-zorro-antd/collapse';
import {ProductFilterPipe} from '../../pipe/product-filter.pipe';
import {firstValueFrom} from 'rxjs';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {StockItem} from '@inventory/entity/inventory.entity';
import {CreateInvoice} from '@sale/entity/invoice.entity';
import {CustomerFacade} from '@customer/data-access/customer.facade';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {CreateCustomer, Customer} from '@customer/entity/customer.entity';

@Component({
  selector: 'sale-invoice',
  imports: [NzButtonModule, ReactiveFormsModule, NzCollapseModule, NzEmptyModule, NzFormModule, NzInputModule, BidiModule, NzDividerModule, AsyncPipe, NzSelectModule, FormsModule, NgOptimizedImage, DecimalPipe, ProductFilterPipe, NgTemplateOutlet, CardContainerComponent, PageContainerComponent],
  standalone: true,
  templateUrl: './sale-invoice.component.html'
})
export class SaleInvoiceComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  private readonly customerFacade = inject(CustomerFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly availableProducts$ = this.saleFacade.availableProducts$;
  private readonly constantPostFee = 380_000;
  createInvoiceLoading$ = this.saleFacade.createInvoiceLoading$;
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

  private readonly itemsControl = this.saleInvoiceForm.get('items') as AbstractControl<StockItem[]>;
  private readonly discountControl = this.saleInvoiceForm.get('discount') as AbstractControl<number>;
  private readonly cityControl = this.saleInvoiceForm.get('city') as AbstractControl<string>;

  private readonly nameControl = this.saleInvoiceForm.get('name') as AbstractControl<string>;
  private readonly addressControl = this.saleInvoiceForm.get('address') as AbstractControl<string>;
  private readonly postalCodeControl = this.saleInvoiceForm.get('postalCode') as AbstractControl<string>;
  private readonly instagramControl = this.saleInvoiceForm.get('instagram') as AbstractControl<string>;
  private readonly telegramControl = this.saleInvoiceForm.get('telegram') as AbstractControl<string>;

  ngOnInit() {
    this.customerFacade.loadCustomers().then();

    this.customerFacade.customersIndex$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        this.customers = index.items;
      });

    firstValueFrom(this.availableProducts$).then(products => {
      this.availableProducts = products;
    });

    this.cityControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((city) => {
      this.postFee.set(city === 'مشهد' ? 0 : this.constantPostFee);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.discountControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((discount) => {
      this.discount.set(discount);
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });
    this.itemsControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => {
      this.totalOrderQuantity.set(items.reduce((acc, curr) => acc + curr.availableQuantity, 0));
      this.totalOrderPrice.set(items.reduce((acc, curr) => acc + curr.sellingUnitPrice * curr.availableQuantity, 0));
      this.postFee.set(this.totalOrderPrice() > 7_000_000 ? 0 : this.postFee());
      this.orderFee.set(this.totalOrderPrice() + this.postFee() - this.discount());
    });

    this.trackPhone();
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

  trackPhone() {
    this.saleInvoiceForm.get('phone')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((phone) => {
        if (phone) {
          const customer = this.customers?.find(c => c.phone === phone);
          if (customer) {
            this.customerId = customer.id;
            this.nameControl?.setValue(customer.name);
            this.nameControl?.disable();
            this.cityControl?.setValue(customer.city);
            this.cityControl?.disable();
            this.addressControl?.setValue(customer.address);
            this.addressControl?.disable();
            this.postalCodeControl?.setValue(customer.postalCode ?? '');
            this.postalCodeControl?.disable();
            this.instagramControl?.setValue(customer.instagram ?? '');
            this.instagramControl?.disable();
            this.telegramControl?.setValue(customer.telegram ?? '');
            this.telegramControl?.disable();
          }
        }
      });
  }

  createNewCustomer(rawValue: any) {
    const customer: CreateCustomer = {
      name: rawValue.name as string,
      phone: rawValue.phone as string,
      city: rawValue.city as string,
      address: rawValue.address as string,
      instagram: rawValue.instagram,
      telegram: rawValue.telegram,
      postal_code: rawValue.postalCode
    };
    this.customerFacade.createCustomer(customer).then();
  }

  submitOrderForm() {
    if (this.saleInvoiceForm.valid) {
      const rawValue = this.saleInvoiceForm.getRawValue();
      if (this.customerId) {
        const form: CreateInvoice = {
          customerId: this.customerId,
          city: rawValue.city as string,
          address: rawValue.address as string,
          description: rawValue.description as string,
          paymentStatus: 'paid',
          shippingPrice: this.postFee(),
          shippingStatus: 'ready-to-ship',
          discount: this.discount(),
          items: rawValue.items ? rawValue.items.map(item => {
            return {
              productId: item.product.id,
              colorId: item.color.id,
              sizeId: item.size.id,
              quantity: this.selectedProducts.find(p => p.product.id === item.product.id)?.availableQuantity ?? 0
            };
          }) : []
        };
        this.saleFacade.createSaleInvoice(form).then(() => {
          location.reload();
        });
      } else {
        this.createNewCustomer(rawValue);
      }
    }
  }
}

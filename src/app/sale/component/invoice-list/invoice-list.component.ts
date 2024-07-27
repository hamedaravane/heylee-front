import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {SaleFacade} from '@sale/data-access/sale.facade';
import {AsyncPipe, CurrencyPipe, DecimalPipe, NgIf} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {PersianDatePipe} from "@sale/pipe/persian-date.pipe";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SaleInvoice} from "@sale/entity/invoice.entity";
import {CurrencyComponent} from "@shared/component/currency-wrapper/currency.component";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzModalModule} from "ng-zorro-antd/modal";
import {InventoryApi} from "@inventory/api/inventory.api";
import {firstValueFrom} from "rxjs";
import {StockItem} from "@inventory/entity/inventory.entity";

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzModalModule, NzButtonModule, NzPaginationModule, AsyncPipe, NzEmptyModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule, PageContainerComponent, CardContainerComponent, PersianDatePipe, CurrencyComponent, NgIf],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inventoryApi = inject(InventoryApi);
  invoiceData: SaleInvoice[] = [];
  loadingState = false;

  editedSaleInvoiceForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    phone: new FormControl<string>('', Validators.required),
    city: new FormControl<string>('', Validators.required),
    postalCode: new FormControl<string | null>(null),
    address: new FormControl<string>('', Validators.required),
    instagram: new FormControl<string | null>(null, [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl<string | null>(null, [Validators.minLength(5), Validators.maxLength(32)]),
    refNumber: new FormControl<string>('', Validators.required),
    paymentStatus: new FormControl<number>(0, Validators.required),
    shippingPrice: new FormControl<number>(0, Validators.required),
    shippingStatus: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    description: new FormControl<string>('', Validators.required),
    items: new FormControl<StockItem[]>([], Validators.minLength(1))
  });

  private nameControl = this.editedSaleInvoiceForm.controls.name;
  private phoneControl = this.editedSaleInvoiceForm.controls.phone;
  private cityControl = this.editedSaleInvoiceForm.controls.city;
  private addressControl = this.editedSaleInvoiceForm.controls.address;
  private postalCodeControl = this.editedSaleInvoiceForm.controls.postalCode;
  private instagramControl = this.editedSaleInvoiceForm.controls.instagram;
  private telegramControl = this.editedSaleInvoiceForm.controls.telegram;
  private descriptionControl = this.editedSaleInvoiceForm.controls.description;
  private refNumberControl = this.editedSaleInvoiceForm.controls.refNumber;
  private itemsControl = this.editedSaleInvoiceForm.controls.items;
  private discountControl = this.editedSaleInvoiceForm.controls.discount;

  ngOnInit() {
    this.saleFacade.loadInvoices().then();
    this.saleFacade.invoices$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(invoices => {
        this.invoiceData = invoices;
      });
    this.saleFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loading => {
        this.loadingState = loading;
      });
  }

  editInvoiceItem(invoice: SaleInvoice) {
    firstValueFrom(this.inventoryApi.availableProducts$).then((availableItems) => {
      this.editedSaleInvoiceForm.patchValue({
        name: invoice.customer.name,
        phone: invoice.customer.phone,
        city: invoice.city,
        address: invoice.address,
        postalCode: invoice.postalCode,
        instagram: invoice.customer.instagram,
        telegram: invoice.customer.telegram,
        description: invoice.description,
        refNumber: invoice.refNumber,
        items: invoice.salesItem.map((item) => {
          const selectedItem = availableItems.find((availableItem) => {
            return availableItem.product.id === item.product.id
          });
          return {
            product: item.product,
            color: item.color,
            size: item.size,
            availableQuantity: selectedItem?.availableQuantity || 0,
            totalPurchased: selectedItem?.totalPurchased || 0,
            totalSold: selectedItem?.totalSold || 0,
            sellingUnitPrice: item.unitPrice
          }
        }),
        discount: invoice.discount,
      });
    }).then(() => {
      const form = {
        customerId: invoice.customer.id,
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
    })

    this.saleFacade.updateSaleInvoice(invoice.id)
  }
}

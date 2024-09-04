import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {PurchaseFacade} from '@purchase/data-access/purchase.facade';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe, DecimalPipe} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PersianDatePipe} from '@shared/pipe/persian-date.pipe';
import {Product} from '@product/entity/product.entity';
import {PurchaseItem} from '@purchase/entity/purchase.entity';
import {IdLabel} from '@shared/entity/common.entity';
import {CurrencyComponent} from '@shared/component/currency-wrapper/currency.component';
import {
  ProductImageContainerComponent
} from '@shared/component/product-image-container/product-image-container.component';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';

@Component({
  selector: 'purchase-receipt',
  templateUrl: './purchase-receipt.component.html',
  imports: [
    PageContainerComponent,
    NzSkeletonModule,
    AsyncPipe,
    NzEmptyModule,
    NzPaginationModule,
    CardContainerComponent,
    PersianDatePipe,
    DecimalPipe,
    CurrencyComponent,
    ProductImageContainerComponent
  ],
  standalone: true
})
export class PurchaseReceiptComponent implements OnInit {
  private readonly purchaseFacade = inject(PurchaseFacade);
  private readonly destroyRef = inject(DestroyRef);
  loadingState = false;
  purchaseInvoices$ = this.purchaseFacade.purchaseInvoices$;

  ngOnInit() {
    this.purchaseFacade.fetchPurchaseInvoices().then();
    this.purchaseFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => this.loadingState = v)
  }

  pageIndexChange(pageIndex: number): void {
    this.purchaseFacade.fetchPurchaseInvoices(pageIndex).then();
  }

  reducePurchaseItems(items: (PurchaseItem & { color: IdLabel } & { size: IdLabel } & { product: Product })[]) {
    return items.reduce((acc, cur) => {
      const key = cur.productId;
      let existingItem = acc.find(item => item.productId === key);
      if (!existingItem) {
        acc.push({
          ...cur,
          colors: [cur.color],
          sizes: [cur.size],
        });
      } else {
        if (!existingItem.colors.some(color => color.id === cur.color.id)) {
          existingItem.colors.push(cur.color);
        }
        if (!existingItem.sizes.some(size => size.id === cur.size.id)) {
          existingItem.sizes.push(cur.size);
        }
      }
      return acc;
    }, new Array<PurchaseItem & { product: Product } & { colors: IdLabel[] } & { sizes: IdLabel[] }>());
  }
}

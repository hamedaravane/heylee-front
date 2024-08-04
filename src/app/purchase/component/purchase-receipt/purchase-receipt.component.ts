import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {PageContainerComponent} from "@shared/component/page-container/page-container.component";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {PurchaseFacade} from "@purchase/data-access/purchase.facade";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AsyncPipe} from "@angular/common";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {CardContainerComponent} from "@shared/component/card-container/card-container.component";
import {PersianDatePipe} from "@sale/pipe/persian-date.pipe";
import {Product} from "@product/entity/product.entity";
import {PurchaseItem} from "@purchase/entity/purchase.entity";
import {IdLabel} from "@shared/entity/common.entity";

@Component({
  selector: 'purchase-receipt',
  templateUrl: './purchase-receipt.component.html',
  imports: [
    PageContainerComponent,
    NzSkeletonModule,
    AsyncPipe,
    NzEmptyModule,
    CardContainerComponent,
    PersianDatePipe
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

  reducePurchaseItems(items: (PurchaseItem & { color: IdLabel } & { size: IdLabel } & { product: Product })[]) {
    return items.reduce((acc, cur, index) => {
      const key = cur.product.code;
      if (!acc.find(item => item.product.code === key)) {
        acc[index].colors.push(cur.color);
        acc[index].sizes.push(cur.size);
        acc.push({
          ...cur,
          colors: acc[index].colors,
          sizes: acc[index].sizes,
          product: cur.product
        })
      }
      return acc;
    }, new Array<PurchaseItem & { product: Product } & { colors: IdLabel[] } & { sizes: IdLabel[] }>())
  }
}

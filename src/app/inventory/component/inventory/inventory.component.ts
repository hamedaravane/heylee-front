import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { InventoryFacade } from '@inventory/data-access/inventory.facade';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { AsyncPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import {
  ProductImageContainerComponent
} from '@shared/component/product-image-container/product-image-container.component';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { GroupStockItemsPipe } from '@inventory/pipe/group-stock-items.pipe';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { colors } from '@colors';
import { StockItem } from '@inventory/entity/inventory.entity';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'inventory-inventory',
  templateUrl: './inventory.component.html',
  imports: [
    PageContainerComponent,
    CardContainerComponent,
    NzEmptyModule,
    AsyncPipe,
    NgOptimizedImage,
    NzSkeletonModule,
    NzBadgeModule,
    DecimalPipe,
    ProductImageContainerComponent,
    GroupStockItemsPipe,
    NzCollapseModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzFlexModule,
    CurrencyComponent,
    ReactiveFormsModule
  ],
  standalone: true
})
export class InventoryComponent implements OnInit {
  private readonly inventoryFacade = inject(InventoryFacade);
  private readonly destroyRef = inject(DestroyRef);
  availableProducts: StockItem[] | null = null;
  filteredAvailableProducts: StockItem[] | null = null;
  filterForm = new FormGroup({
    value: new FormControl<string | null>(null),
    key: new FormControl<'code' | 'name' | 'color' | 'size'>('code')
  });

  ngOnInit() {
    this.inventoryFacade.fetchAvailableProducts().then();
    this.inventoryFacade.availableProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(products => (this.availableProducts = products));
    this.filterForm.valueChanges
      .pipe(
        map(filter => {
          if (!this.availableProducts) return null;
          return this.availableProducts.filter(product => {
            switch (filter.key) {
              case 'name':
                return product.product.name.toLowerCase().includes(filter.value?.toLowerCase() ?? '');
              case 'color':
                return product.color.label.includes(filter.value?.toLowerCase() ?? '');
              case 'size':
                return product.size.label.toLowerCase().includes(filter.value?.toLowerCase() ?? '');
              default:
                return product.product.code.toLowerCase().includes(filter.value?.toLowerCase() ?? '');
            }
          });
        }),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(products => (this.filteredAvailableProducts = products));
  }

  protected readonly colors = colors;
}

import { Component, inject, OnInit } from '@angular/core';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ProductImageContainerComponent } from '@shared/component/product-image-container/product-image-container.component';
import { SelectionFacade } from '@inventory/data-access/selection.facade';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ProductFilterPipe } from '@sale/pipe/product-filter.pipe';
import { StockItemSelection } from '@inventory/entity/inventory.entity';

@Component({
  standalone: true,
  selector: 'available-items',
  imports: [
    NzInputModule,
    NzCollapseModule,
    NzEmptyModule,
    NzButtonModule,
    FormsModule,
    CardContainerComponent,
    ProductImageContainerComponent,
    CurrencyComponent,
    AsyncPipe,
    DecimalPipe,
    ProductFilterPipe
  ],
  template: ` <nz-input-group [nzSuffix]="suffixIconSearch">
      <input
        nz-input
        type="search"
        pattern="^[a-zA-Z0-9]{1,12}$"
        maxlength="12"
        [(ngModel)]="searchText"
        placeholder="جستجو در کد محصولات"
      />
    </nz-input-group>
    <nz-collapse class="mt-4">
      <nz-collapse-panel nzHeader="لیست همه محصولات موجود" nzActive="false">
        @if (availableProducts$ | async; as availableProducts) {
          @for (product of availableProducts | filterProductsByCode: searchText; track $index) {
            <card-container>
              <div class="flex justify-between gap-4">
                <product-image-container [imageSrc]="product.product.image"></product-image-container>
                <div class="grow">
                  <div class="text-xs max-w-sm">
                    <span class="line-clamp-1">{{ product.product.name }}</span>
                    <span class="line-clamp-1 font-mono">{{ product.product.code }}</span>
                    <div class="flex justify-between">
                      <span class="line-clamp-1">{{ product.color.label }}</span>
                      <span class="line-clamp-1 font-mono">{{ product.size.label }}</span>
                      <span class="line-clamp-1 font-mono">{{ product.availableQuantity }}</span>
                    </div>
                    <div>
                      <span class="font-mono">{{ product.sellingUnitPrice | number }}</span>
                      <currency-wrapper></currency-wrapper>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    [nzLoading]="loading"
                    class="leading-none"
                    type="button"
                    nz-button
                    nzType="primary"
                    nzSize="small"
                    (click)="addItem(product)"
                  >
                    <i class="fa-solid fa-plus fa-sm leading-tight"></i>
                  </button>
                </div>
              </div>
            </card-container>
          } @empty {
            <nz-empty nzNotFoundContent="کالایی یافت نشد"></nz-empty>
          }
        }
      </nz-collapse-panel>
    </nz-collapse>
    <ng-template #suffixIconSearch>
      <i class="fa-solid fa-search text-gray-500"></i>
    </ng-template>`
})
export class AvailableItemsComponent implements OnInit {
  private readonly selectionFacade = inject(SelectionFacade);
  availableProducts$ = this.selectionFacade.availableItems$;
  searchText = '';
  loading = false;

  ngOnInit() {
    this.selectionFacade.initialize();
  }

  addItem(item: StockItemSelection) {
    this.selectionFacade.addItem(item);
  }
}

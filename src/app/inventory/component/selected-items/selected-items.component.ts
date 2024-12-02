import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { CardContainerComponent } from '@shared/component/card-container/card-container.component';
import { SelectionFacade } from '@inventory/data-access/selection.facade';
import { StockItemSelection } from '@inventory/entity/inventory.entity';

@Component({
  standalone: true,
  selector: 'selected-items',
  template: `@if (selectedProducts$ | async; as selectedProducts) {
    @for (selectedProduct of selectedProducts; track $index) {
      <card-container class="mb-2 last:mb-0">
        <div class="grid grid-cols-12 gap-4">
          <div
            class="col-span-3 h-12 w-12 text-center content-center inline-block overflow-clip border border-solid border-gray-600"
          >
            @if (selectedProduct.product.image) {
              <img [src]="selectedProduct.product.image" class="w-12 h-full object-cover" alt="product image" />
            } @else {
              <i class="fa-solid fa-image fa-xl text-gray-400"></i>
            }
          </div>
          <div class="col-span-8">
            <div class="grid grid-cols-2 grid-rows-3 text-start w-full text-xs">
              <span class="line-clamp-1">{{ selectedProduct.product.name }}</span>
              <span class="line-clamp-1 font-mono">{{ selectedProduct.product.code }}</span>
              <span class="line-clamp-1">{{ selectedProduct.color.label }}</span>
              <span class="line-clamp-1 font-mono">{{ selectedProduct.size.label }}</span>
              <div class="line-clamp-1 col-span-1">
                <span class="font-mono">{{ selectedProduct.sellingUnitPrice | number }}</span>
                <currency-wrapper></currency-wrapper>
              </div>
              <span class="line-clamp-1 font-mono">{{ selectedProduct.selectedQuantity }}</span>
            </div>
          </div>
          <div class="col-span-1 justify-self-end self-center">
            <button
              [nzLoading]="loading"
              class="leading-none"
              nz-button
              nzType="primary"
              type="button"
              nzDanger
              nzSize="small"
              (click)="removeItem(selectedProduct)"
            >
              <i class="fa-solid fa-trash fa-sm leading-tight"></i>
            </button>
          </div>
        </div>
      </card-container>
    } @empty {
      <nz-empty nzNotFoundContent="کالایی یافت نشد"></nz-empty>
    }
  }`,
  imports: [NzButtonModule, NzEmptyModule, CurrencyComponent, DecimalPipe, CardContainerComponent, AsyncPipe]
})
export class SelectedItemsComponent {
  private readonly selectionFacade = inject(SelectionFacade);
  selectedProducts$ = this.selectionFacade.selectedItems$;
  loading = false;

  removeItem(item: StockItemSelection) {
    this.selectionFacade.removeItem(item);
  }
}

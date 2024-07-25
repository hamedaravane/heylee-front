import {inject, Injectable} from '@angular/core';
import {InventoryFacade} from '@inventory/data-access/inventory.facade';
import {Observable} from 'rxjs';
import {StockItem} from '@inventory/entity/inventory.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryApi {
  private readonly inventoryFacade = inject(InventoryFacade);
  private isFetched = false;

  /**
   * A getter that returns an observable stream of available products.
   *
   * This getter provides a way to subscribe to changes in the list of available products.
   * It exposes an observable derived from `availableProductsSubject`, allowing subscribers
   * to react to updates in the available products list.
   *
   * @returns { Observable<StockItem[]> } An observable stream of available products.
   *
   * @example
   * // Usage example
   * this.availableProducts$.subscribe(products => {
   *   console.log("Available products:", products);
   * });
   */
  get availableProducts$(): Observable<StockItem[]> {
    if (!this.isFetched) {
      this.inventoryFacade.fetchAvailableProducts().then(() => {
        this.isFetched = true;
      });
      return this.inventoryFacade.availableProducts$;
    }
    return this.inventoryFacade.availableProducts$;
  }

  fetchAvailableProducts(): void {
    this.inventoryFacade.fetchAvailableProducts().then();
  }
}

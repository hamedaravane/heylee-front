import { inject, Injectable } from '@angular/core';
import { InventoryFacade } from '@inventory/data-access/inventory.facade';

@Injectable({
  providedIn: 'root'
})
export class InventoryApi {
  private readonly inventoryFacade = inject(InventoryFacade);
  private isFetched = false;

  get availableProducts$() {
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

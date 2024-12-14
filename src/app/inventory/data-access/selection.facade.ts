import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { StockItemSelection } from '@inventory/entity/inventory.entity';
import { InventoryFacade } from './inventory.facade';
import { SalesItem, salesItemToStockItemSelection } from '@sale/entity/invoice.entity';

@Injectable()
export class SelectionFacade {
  private availableItemsSubject = new BehaviorSubject<StockItemSelection[]>([]);
  private selectedItemsSubject = new BehaviorSubject<StockItemSelection[]>([]);

  constructor(private readonly inventoryFacade: InventoryFacade) {}

  initialize() {
    this.inventoryFacade.fetchAvailableProducts();
    this.inventoryFacade.availableProducts$.pipe(take(1)).subscribe(value => {
      this.availableItemsSubject.next(
        value.map(item => {
          return {
            ...item,
            selectedQuantity: 0
          };
        })
      );
    });
  }

  get availableItems$(): Observable<StockItemSelection[]> {
    return this.availableItemsSubject.asObservable();
  }

  get selectedItems$(): Observable<StockItemSelection[]> {
    return this.selectedItemsSubject.asObservable();
  }

  set selectedItems$(items: SalesItem[]) {
    const selected = items.map<StockItemSelection>(i => salesItemToStockItemSelection(i));
    this.selectedItemsSubject.next(selected);
  }

  addItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0) return;

    const availableItems = this.availableItemsSubject.getValue();
    const selectedItems = this.selectedItemsSubject.getValue();

    const availableIndex = this.findItemIndex(availableItems, item);

    if (availableIndex === -1 || availableItems[availableIndex].availableQuantity < quantity) {
      return;
    }

    const selectedIndex = this.findItemIndex(selectedItems, item);

    availableItems[availableIndex].availableQuantity -= quantity;
    if (availableItems[availableIndex].availableQuantity <= 0) {
      availableItems.splice(availableIndex, 1);
    }

    if (selectedIndex !== -1) {
      selectedItems[selectedIndex].selectedQuantity += quantity;
    } else {
      const newItem = { ...item, selectedQuantity: quantity };
      selectedItems.push(newItem);
    }

    this.availableItemsSubject.next([...availableItems]);
    this.selectedItemsSubject.next([...selectedItems]);
  }

  removeItem(item: StockItemSelection, quantity: number = 1): void {
    if (quantity <= 0) return;

    const availableItems = this.availableItemsSubject.getValue();
    const selectedItems = this.selectedItemsSubject.getValue();

    const selectedIndex = this.findItemIndex(selectedItems, item);

    if (selectedIndex === -1 || selectedItems[selectedIndex].selectedQuantity < quantity) {
      return;
    }

    const availableIndex = this.findItemIndex(availableItems, item);

    selectedItems[selectedIndex].selectedQuantity -= quantity;
    if (selectedItems[selectedIndex].selectedQuantity <= 0) {
      selectedItems.splice(selectedIndex, 1);
    }

    if (availableIndex !== -1) {
      availableItems[availableIndex].availableQuantity += quantity;
    } else {
      const newItem = { ...item, availableQuantity: quantity };
      availableItems.push(newItem);
    }

    this.availableItemsSubject.next([...availableItems]);
    this.selectedItemsSubject.next([...selectedItems]);
  }

  private findItemIndex(array: StockItemSelection[], item: StockItemSelection): number {
    return array.findIndex(
      i => i.product.id === item.product.id && i.color.id === item.color.id && i.size.id === item.size.id
    );
  }
}

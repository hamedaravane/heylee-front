import {Pipe} from '@angular/core';
import {StockItem} from '@inventory/entity/inventory.entity';

@Pipe({
  standalone: true,
  name: 'filterProductsByCode'
})
export class ProductFilterPipe {
  transform(value: StockItem[], searchText: string): StockItem[] {
    if (!value || !searchText) {
      return value;
    }
    return value.filter(product => product.product?.code?.toLowerCase().includes(searchText.toLowerCase()));
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { StockItemSelection } from '@inventory/entity/inventory.entity';

@Pipe({
  standalone: true,
  name: 'filterProductsByCode'
})
export class ProductFilterPipe implements PipeTransform {
  transform(value: StockItemSelection[], searchText: string): StockItemSelection[] {
    if (!value || !searchText) {
      return value;
    }
    return value.filter(product => product.product?.code?.toLowerCase().includes(searchText.toLowerCase()));
  }
}

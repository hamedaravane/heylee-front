import {Pipe, PipeTransform} from '@angular/core';
import {GroupedStockItem, StockItem} from '@inventory/entity/inventory.entity';

@Pipe({
  name: 'groupItems',
  standalone: true,
})
export class GroupStockItemsPipe implements PipeTransform {
  transform(items: StockItem[]): GroupedStockItem[] {
    const grouped: { [key: string]: GroupedStockItem } = {};

    for (const item of items) {
      const code = item.product.code;
      if (!grouped[code]) {
        grouped[code] = {
          code: code,
          name: item.product.name,
          image: item.product.image,
          description: item.product.description,
          colors: [],
          sellingUnitPrice: item.sellingUnitPrice,
          totalAvailableQuantity: 0
        };
      }

      grouped[code].totalAvailableQuantity += item.availableQuantity;

      let color = grouped[code].colors.find(c => c.label === item.color.label);
      if (!color) {
        color = { label: item.color.label, sizes: [], total_quantity: 0 };
        grouped[code].colors.push(color);
      }

      color.total_quantity += item.availableQuantity;

      const size = color.sizes.find(s => s.label === item.size.label);
      if (!size) {
        color.sizes.push({ label: item.size.label, quantity: item.availableQuantity });
      } else {
        size.quantity += item.availableQuantity;
      }
    }

    return Object.values(grouped);
  }
}

import { Pipe } from '@angular/core';
import { ProductData } from '../entity/product.entity';

@Pipe({
  standalone: true,
  name: 'filterProductsByCode'
})
export class ProductFilterPipe {
  transform(value: ProductData[], searchText: string): ProductData[] {
    if (!value || !searchText) {
      return value;
    }
    return value.filter(product => product.product?.code?.toLowerCase().includes(searchText.toLowerCase()));
  }
}

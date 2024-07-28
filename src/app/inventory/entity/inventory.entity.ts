import {IdLabel} from '@shared/entity/common.entity';
import {Product, ProductDto} from '@product/entity/product.entity';
import {InvoiceItem} from '@sale/entity/invoice.entity';

export interface StockItem {
  product: Omit<Product, 'createdAt' | 'updatedAt'>;
  color: IdLabel;
  size: IdLabel;
  availableQuantity: number;
  totalPurchased: number;
  totalSold: number;
  sellingUnitPrice: number;
}

export interface StockItemDto {
  product: Omit<ProductDto, 'created_at' | 'updated_at'>;
  color: IdLabel;
  size: IdLabel;
  available_quantity: number;
  total_purchased: number;
  total_sold: number;
  selling_unit_price: number;
}

export interface StockItemSelection extends StockItem {
  selectedQuantity: number;
}

export function selectedProductToInvoiceItem(selectedProduct: StockItemSelection): InvoiceItem {
  return {
    productId: selectedProduct.product.id,
    colorId: selectedProduct.color.id,
    sizeId: selectedProduct.size.id,
    quantity: selectedProduct.selectedQuantity,
  };
}

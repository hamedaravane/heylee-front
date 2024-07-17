export interface PurchaseItemDTO {
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
  purchase_unit_price: number;
  selling_unit_price: number;
}

export interface PurchaseDTO {
  number: string;
  supplier_id: number;
  description: string;
  total_price: number;
  discount: number;
  paid_price: number;
  items: PurchaseItemDTO[];
}

export interface PurchaseItem {
  productId: number;
  colorId: number;
  sizeId: number;
  quantity: number;
  purchaseUnitPrice: number;
  sellingUnitPrice: number;
}

export interface Purchase {
  number: string;
  supplierId: number;
  description: string;
  totalPrice: number;
  discount: number;
  paidPrice: number;
  items: PurchaseItem[];
}

export function mapPurchaseToDTO(purchase: Purchase): PurchaseDTO {
  return {
    number: purchase.number,
    supplier_id: purchase.supplierId,
    description: purchase.description,
    total_price: purchase.totalPrice,
    discount: purchase.discount,
    paid_price: purchase.paidPrice,
    items: purchase.items.map(item => ({
      product_id: item.productId,
      color_id: item.colorId,
      size_id: item.sizeId,
      quantity: item.quantity,
      purchase_unit_price: item.purchaseUnitPrice,
      selling_unit_price: item.sellingUnitPrice
    }))
  };
}
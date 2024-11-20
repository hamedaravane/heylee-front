import { SupplierDto } from '@supplier/entity/supplier.entity';
import { IdLabel } from '@shared/entity/common.entity';
import { Product, ProductDto } from '@product/entity/product.entity';

export type CreatePurchaseItemDTO = Omit<PurchaseItemDto, 'id' | 'created_at' | 'purchase_id'>;

export type CreatePurchaseInvoiceDTO = Omit<PurchaseInvoiceDto, 'id' | 'created_at' | 'supplier' | 'purchases_item'> & {
  items: CreatePurchaseItemDTO[];
};

export type CreatePurchaseItem = Omit<PurchaseItem, 'id' | 'createdAt' | 'purchaseId'>;

export type CreatePurchaseInvoice = Omit<PurchaseInvoice, 'id' | 'createdAt' | 'supplier' | 'purchasesItem'> & {
  items: CreatePurchaseItem[];
};

export function mapCreatePurchaseInvoiceToDTO(purchase: CreatePurchaseInvoice): CreatePurchaseInvoiceDTO {
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

export interface PurchaseItemDto {
  id: number;
  purchase_id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
  purchase_unit_price: number;
  selling_unit_price: number;
}

export interface PurchaseInvoiceDto {
  id: number;
  number: string;
  supplier_id: number;
  description: string;
  total_price: number;
  discount: number;
  paid_price: number;
  created_at: string;
  supplier: SupplierDto;
  purchases_item: (PurchaseItemDto & { color: IdLabel } & { size: IdLabel } & {
    product: ProductDto;
  })[];
}

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  colorId: number;
  sizeId: number;
  quantity: number;
  purchaseUnitPrice: number;
  sellingUnitPrice: number;
}

export interface PurchaseInvoice {
  id: number;
  number: string;
  supplierId: number;
  description: string;
  totalPrice: number;
  discount: number;
  paidPrice: number;
  createdAt: string;
  supplier: SupplierDto;
  purchasesItem: (PurchaseItem & { color: IdLabel } & { size: IdLabel } & {
    product: Product;
  })[];
}

export function mapPurchaseInvoiceDtoToDomain(dto: PurchaseInvoiceDto): PurchaseInvoice {
  return {
    id: dto.id,
    number: dto.number,
    supplierId: dto.supplier_id,
    description: dto.description,
    totalPrice: dto.total_price,
    discount: dto.discount,
    paidPrice: dto.paid_price,
    createdAt: dto.created_at,
    supplier: dto.supplier,
    purchasesItem: dto.purchases_item.map(item => ({
      id: item.id,
      purchaseId: item.purchase_id,
      productId: item.product_id,
      colorId: item.color_id,
      sizeId: item.size_id,
      quantity: item.quantity,
      purchaseUnitPrice: item.purchase_unit_price,
      sellingUnitPrice: item.selling_unit_price,
      color: item.color,
      size: item.size,
      product: {
        ...item.product,
        createdAt: item.product.created_at,
        updatedAt: item.product.updated_at
      }
    }))
  };
}

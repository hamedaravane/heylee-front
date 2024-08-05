import {Customer, CustomerDto} from '@customer/entity/customer.entity';
import {Product, ProductDto} from '@product/entity/product.entity';
import {IdLabel} from '@shared/entity/common.entity';
import {StockItemSelection} from '@inventory/entity/inventory.entity';

export interface SalesItemDTO {
  id: number;
  user_id: number;
  sales_invoice_id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
  purchase_unit_price: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product: ProductDto;
  color: IdLabel;
  size: IdLabel;
}

export interface SaleInvoiceDTO {
  id: number;
  number: string;
  user_id: number;
  customer_id: number;
  city: string;
  postal_code: string | null;
  address: string;
  description: string;
  payment_status: string;
  shipping_status: string;
  ref_number: string | null;
  total_price: number;
  discount: number;
  shipping_price: number;
  paid_price: number;
  created_at: string;
  customer: CustomerDto;
  sales_item: SalesItemDTO[];
}

export interface SalesItem {
  id: number;
  userId: number;
  salesInvoiceId: number;
  productId: number;
  colorId: number;
  sizeId: number;
  quantity: number;
  purchaseUnitPrice: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  product: Product;
  color: IdLabel;
  size: IdLabel;
}

export interface SaleInvoice {
  id: number;
  number: string;
  userId: number;
  customerId: number;
  city: string;
  postalCode: string | null;
  address: string;
  description: string;
  paymentStatus: string;
  shippingStatus: string;
  refNumber: string | null;
  totalPrice: number;
  discount: number;
  shippingPrice: number;
  paidPrice: number;
  createdAt: string;
  customer: Customer;
  salesItem: SalesItem[];
}

export interface InvoiceItemDTO {
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
}

export interface CreateUpdateInvoiceDTO {
  customer_id: number;
  city: string;
  address: string;
  description: string;
  payment_status: string;
  shipping_status: string;
  shipping_price: number;
  discount: number;
  ref_number: string | null;
  postal_code: string | null;
  items: InvoiceItemDTO[];
}

export interface InvoiceItem {
  productId: number;
  colorId: number;
  sizeId: number;
  quantity: number;
}

export interface CreateUpdateInvoice {
  customerId: number;
  city: string;
  address: string;
  description: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingPrice: number;
  discount: number;
  refNumber: string | null;
  postalCode: string | null;
  items: InvoiceItem[];
}

export function convertCreateUpdateInvoiceToDto(invoice: CreateUpdateInvoice): CreateUpdateInvoiceDTO {
  return {
    customer_id: invoice.customerId,
    city: invoice.city,
    address: invoice.address,
    description: invoice.description,
    payment_status: invoice.paymentStatus,
    shipping_status: invoice.shippingStatus,
    shipping_price: invoice.shippingPrice,
    discount: invoice.discount,
    ref_number: invoice.refNumber,
    postal_code: invoice.postalCode,
    items: invoice.items.map(item => ({
      product_id: item.productId,
      color_id: item.colorId,
      size_id: item.sizeId,
      quantity: item.quantity
    }))
  };
}

export function convertCreateUpdateInvoiceDtoToEntity(dto: CreateUpdateInvoiceDTO): CreateUpdateInvoice {
  return {
    customerId: dto.customer_id,
    city: dto.city,
    address: dto.address,
    description: dto.description,
    paymentStatus: dto.payment_status,
    shippingStatus: dto.shipping_status,
    shippingPrice: dto.shipping_price,
    discount: dto.discount,
    refNumber: dto.ref_number,
    postalCode: dto.postal_code,
    items: dto.items.map(item => ({
      productId: item.product_id,
      colorId: item.color_id,
      sizeId: item.size_id,
      quantity: item.quantity
    }))
  };
}

export function salesItemToStockItemSelection(item: SalesItem): StockItemSelection {
  return {
    product: item.product,
    color: item.color,
    size: item.size,
    availableQuantity: 0,
    sellingUnitPrice: item.unitPrice,
    selectedQuantity: item.quantity
  }
}

import {Customer, CustomerDto, mapCustomerDtoToCustomer, mapCustomerToDto} from '@customer/entity/customer.entity';
import {mapProductDtoToProduct, mapProductToDto, Product, ProductDto} from '@product/entity/product.entity';
import {IdLabel} from '@shared/entity/common.entity';

export interface SaleInvoiceDto {
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
  sales_item: SaleItemDto[];
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
  salesItems: SaleItem[];
}

export interface SaleItemDto {
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

export interface SaleItem {
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

export function mapSaleItemDtoToSaleItem(dto: SaleItemDto): SaleItem {
  return {
    ...dto,
    userId: dto.user_id,
    salesInvoiceId: dto.sales_invoice_id,
    productId: dto.product_id,
    colorId: dto.color_id,
    sizeId: dto.size_id,
    purchaseUnitPrice: dto.purchase_unit_price,
    unitPrice: dto.unit_price,
    totalPrice: dto.total_price,
    createdAt: dto.created_at,
    product: mapProductDtoToProduct(dto.product),
  };
}

export function mapInvoiceDtoToInvoice(dto: SaleInvoiceDto): SaleInvoice {
  return {
    ...dto,
    userId: dto.user_id,
    customerId: dto.customer_id,
    postalCode: dto.postal_code,
    paymentStatus: dto.payment_status,
    shippingStatus: dto.shipping_status,
    refNumber: dto.ref_number,
    totalPrice: dto.total_price,
    shippingPrice: dto.shipping_price,
    paidPrice: dto.paid_price,
    createdAt: dto.created_at,
    customer: mapCustomerDtoToCustomer(dto.customer),
    salesItems: dto.sales_item.map(mapSaleItemDtoToSaleItem)
  };
}

export function mapSaleItemToDto(data: SaleItem): SaleItemDto {
  return {
    ...data,
    user_id: data.userId,
    sales_invoice_id: data.salesInvoiceId,
    product_id: data.productId,
    color_id: data.colorId,
    size_id: data.sizeId,
    purchase_unit_price: data.purchaseUnitPrice,
    unit_price: data.unitPrice,
    total_price: data.totalPrice,
    created_at: data.createdAt,
    product: mapProductToDto(data.product),
  };
}

export function mapInvoiceToInvoiceDto(data: SaleInvoice): SaleInvoiceDto {
  return {
    ...data,
    user_id: data.userId,
    customer_id: data.customerId,
    postal_code: data.postalCode,
    payment_status: data.paymentStatus,
    shipping_status: data.shippingStatus,
    ref_number: data.refNumber,
    total_price: data.totalPrice,
    shipping_price: data.shippingPrice,
    paid_price: data.paidPrice,
    created_at: data.createdAt,
    customer: mapCustomerToDto(data.customer),
    sales_item: data.salesItems.map(mapSaleItemToDto)
  };
}

export type CreateInvoice = Pick<
  SaleInvoice,
  'customerId' | 'city' | 'address' | 'description' | 'paymentStatus' | 'shippingStatus' | 'shippingPrice' | 'discount'
> & {
  items: CreateInvoiceItem[];
};

type CreateInvoiceItem = Pick<
  SaleItem,
  'productId' | 'colorId' | 'sizeId' | 'quantity'
>;

export type CreateInvoiceDto = Pick<
  SaleInvoiceDto,
  'customer_id' | 'city' | 'address' | 'description' | 'payment_status' | 'shipping_status' | 'shipping_price' | 'discount'
> & {
  items: CreateInvoiceItemDto[];
};

type CreateInvoiceItemDto = Pick<
  SaleItemDto,
  'product_id' | 'color_id' | 'size_id' | 'quantity'
>;

export type FullInvoice = Pick<
  SaleInvoice,
  | 'id'
  | 'number'
  | 'userId'
  | 'customerId'
  | 'city'
  | 'postalCode'
  | 'address'
  | 'description'
  | 'paymentStatus'
  | 'shippingStatus'
  | 'refNumber'
  | 'totalPrice'
  | 'discount'
  | 'shippingPrice'
  | 'paidPrice'
  | 'createdAt'
>;

export type FullInvoiceDto = Pick<
  SaleInvoiceDto,
  | 'id'
  | 'number'
  | 'user_id'
  | 'customer_id'
  | 'city'
  | 'postal_code'
  | 'address'
  | 'description'
  | 'payment_status'
  | 'shipping_status'
  | 'ref_number'
  | 'total_price'
  | 'discount'
  | 'shipping_price'
  | 'paid_price'
  | 'created_at'
>;


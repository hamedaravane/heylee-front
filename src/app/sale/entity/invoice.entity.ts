import {colors} from '@colors';

export interface InvoiceDTO {
  ok: boolean;
  result: {
    items: InvoiceItemDTO[];
    _links: LinksDTO;
    _meta: MetaDTO;
  };
}

export interface InvoiceItemDTO {
  id: number;
  number: string;
  user_id: number;
  customer_id: number;
  city: string;
  postal_code: string | null;
  address: string;
  description: string;
  payment_status: 'unpaid' | 'paid';
  shipping_status: 'canceled' | 'shipped' | 'ready-to-ship';
  total_price: number;
  discount: number;
  shipping_price: number;
  paid_price: number;
  created_at: string;
  customer: CustomerDTO | undefined;
}

export interface CustomerDTO {
  id: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  created_at: string | null;
}

export interface LinksDTO {
  self: LinkDTO;
  first: LinkDTO;
  last: LinkDTO;
}

export interface LinkDTO {
  href: string;
}

export interface MetaDTO {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export interface Invoice {
  items: InvoiceItem[];
  links: Links;
  meta: Meta;
}

interface Status {
  value: string;
  persianLabel: string;
  color: string;
}

export interface InvoiceItem {
  id: number;
  number: string;
  userId: number;
  customerId: number;
  city: string;
  postalCode: string | null;
  address: string;
  description: string;
  paymentStatus: Status;
  shippingStatus: Status;
  totalPrice: number;
  discount: number;
  shippingPrice: number;
  paidPrice: number;
  createdAt: string;
  customer?: Customer;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  createdAt: string | null;
}

export interface Links {
  self: Link;
  first: Link;
  last: Link;
}

export interface Link {
  href: string;
}

export interface Meta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export function mapInvoiceDTOToEntity(dto: InvoiceDTO): Invoice {
  return {
    items: dto.result.items.map(mapInvoiceItemDTOToEntity),
    links: mapLinksDTOToEntity(dto.result._links),
    meta: mapMetaDTOToEntity(dto.result._meta),
  };
}

function statusValueToPersianLabel(value: 'unpaid' | 'paid' | 'canceled' | 'shipped' | 'ready-to-ship'): Status {
  switch (value) {
    case "paid":
      return {value, persianLabel: 'پرداخت شده', color: colors.teal_5};
    case "unpaid":
      return {value, persianLabel: 'پرداخت نشده', color: colors.rose_5};
    case "canceled":
      return {value, persianLabel: 'لغو شده', color: colors.rose_5};
    case "shipped":
      return {value, persianLabel: 'ارسال شده', color: colors.teal_5};
    case "ready-to-ship":
      return {value, persianLabel: 'آماده ارسال', color: colors.sky_5};
    default:
      throw new Error(`Unknown status value: ${value}`);
  }
}

// utils/date-formatter.ts
export function formatDateToPersian(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

function mapInvoiceItemDTOToEntity(dto: InvoiceItemDTO): InvoiceItem {
  return {
    id: dto.id,
    number: dto.number,
    userId: dto.user_id,
    customerId: dto.customer_id,
    city: dto.city,
    postalCode: dto.postal_code,
    address: dto.address,
    description: dto.description,
    paymentStatus: statusValueToPersianLabel(dto.payment_status),
    shippingStatus: statusValueToPersianLabel(dto.shipping_status),
    totalPrice: dto.total_price,
    discount: dto.discount,
    shippingPrice: dto.shipping_price,
    paidPrice: dto.paid_price,
    createdAt: formatDateToPersian(new Date(dto.created_at)),
    customer: dto.customer ? mapCustomerDTOToEntity(dto.customer) : undefined,
  };
}

function mapCustomerDTOToEntity(dto: CustomerDTO): Customer {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    city: dto.city,
    address: dto.address,
    createdAt: dto.created_at ? formatDateToPersian(new Date(dto.created_at)) : null,
  };
}

function mapLinksDTOToEntity(dto: LinksDTO): Links {
  return {
    self: mapLinkDTOToEntity(dto.self),
    first: mapLinkDTOToEntity(dto.first),
    last: mapLinkDTOToEntity(dto.last),
  };
}

function mapLinkDTOToEntity(dto: LinkDTO): Link {
  return {
    href: dto.href,
  };
}

function mapMetaDTOToEntity(dto: MetaDTO): Meta {
  return {
    totalCount: dto.totalCount,
    pageCount: dto.pageCount,
    currentPage: dto.currentPage,
    perPage: dto.perPage,
  };
}

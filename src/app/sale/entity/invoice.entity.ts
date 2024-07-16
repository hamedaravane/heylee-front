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
  payment_status: string;
  shipping_status: string;
  total_price: number;
  discount: number;
  shipping_price: number;
  paid_price: number;
  created_at: string;
  customer: CustomerDTO;
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

export interface InvoiceItem {
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
  totalPrice: number;
  discount: number;
  shippingPrice: number;
  paidPrice: number;
  createdAt: Date;
  customer: Customer;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  createdAt: Date | null;
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
    paymentStatus: dto.payment_status,
    shippingStatus: dto.shipping_status,
    totalPrice: dto.total_price,
    discount: dto.discount,
    shippingPrice: dto.shipping_price,
    paidPrice: dto.paid_price,
    createdAt: new Date(dto.created_at),
    customer: mapCustomerDTOToEntity(dto.customer),
  };
}

function mapCustomerDTOToEntity(dto: CustomerDTO): Customer {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    city: dto.city,
    address: dto.address,
    createdAt: dto.created_at ? new Date(dto.created_at) : null,
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

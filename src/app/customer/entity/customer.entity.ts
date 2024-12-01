export interface Customer {
  id: number;
  name: string;
  phone: string;
  postalCode: string | null;
  telegram: string | null;
  instagram: string | null;
  city: string;
  address: string;
  cashbackBalance: number;
  createdAt: string | null;
}

export interface CustomerDto {
  id: number;
  name: string;
  phone: string;
  postal_code: string | null;
  telegram: string | null;
  instagram: string | null;
  city: string;
  address: string;
  cashback_balance: number;
  created_at: string | null;
}

export type FromCustomerDto = Omit<CustomerDto, 'id' | 'created_at' | 'cashback_balance'>;
export type FormCustomer = Omit<Customer, 'id' | 'createdAt' | 'cashbackBalance'>;

export function mapCustomerDtoToCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    postalCode: dto.postal_code,
    telegram: dto.telegram,
    instagram: dto.instagram,
    city: dto.city,
    address: dto.address,
    cashbackBalance: dto.cashback_balance,
    createdAt: dto.created_at
  };
}

export function mapCustomerToDto(data: Customer): CustomerDto {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    postal_code: data.postalCode,
    telegram: data.telegram,
    instagram: data.instagram,
    city: data.city,
    address: data.address,
    cashback_balance: data.cashbackBalance,
    created_at: data.createdAt
  };
}

export interface Supplier {
  id: number;
  name: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  createdAt: string;
}

export interface SupplierDto {
  id?: number;
  name: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  created_at?: string;
}

export function mapSupplierDtoToSupplier(dto: SupplierDto): Supplier {
  try {
    return {
      ...dto,
      createdAt: dto.created_at!,
      id: dto.id!,
    };
  } catch (error) {
    throw error;
  }
}

export function mapSupplierToSupplierDto(supplier: Supplier): SupplierDto {
  return {
    name: supplier.name,
    address: supplier.address,
    phone: supplier.phone,
    telegram: supplier.telegram,
    instagram: supplier.instagram,
  }
}

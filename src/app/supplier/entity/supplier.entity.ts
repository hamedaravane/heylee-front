export interface SupplierDTO {
  name: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  created_at?: string;
  id?: number;
}

export interface Supplier {
  name: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  createdAt: string;
  id: number;
}

export function mapSupplierDTOToSupplier(dto: SupplierDTO): Supplier {
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

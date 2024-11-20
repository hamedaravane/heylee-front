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
  id: number;
  name: string;
  address: string;
  phone: string;
  telegram: string;
  instagram: string;
  created_at: string;
}

export type CreateSupplierDto = Omit<SupplierDto, 'id' | 'created_at'>;
export type CreateSupplier = Omit<Supplier, 'id' | 'createdAt'>;

export function mapSupplierDtoToSupplier(dto: SupplierDto): Supplier {
  return {
    ...dto,
    createdAt: dto.created_at,
    id: dto.id
  };
}

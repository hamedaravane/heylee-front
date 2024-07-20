export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductDto {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string | null;
}

export function mapProductDtoToProduct(dto: ProductDto): Product {
  return {
    ...dto,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at
  };
}

export function mapProductToDto(data: Product): ProductDto {
  return {
    ...data,
    created_at: data.createdAt,
    updated_at: data.updatedAt
  };
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string | null;
}

export interface Color {
  id: number;
  label: string;
}

export interface Size {
  id: number;
  label: string;
}

export interface ProductDataDto {
  product: Product;
  color: Color;
  size: Size;
  available_quantity: number;
  total_purchased: number;
  total_sold: number;
  selling_unit_price: number;
}

export interface ProductData {
  product: Product;
  color: Color;
  size: Size;
  availableQuantity: number;
  totalPurchased: number;
  totalSold: number;
  sellingUnitPrice: number;
}

export function productDtoToProductData(productDto: ProductDataDto): ProductData {
  return {
    product: productDto.product,
    color: productDto.color,
    size: productDto.size,
    availableQuantity: productDto.available_quantity,
    totalPurchased: productDto.total_purchased,
    totalSold: productDto.total_sold,
    sellingUnitPrice: productDto.selling_unit_price,
  };
}

export interface ProductResponse {
  ok: boolean;
  result: ProductDataDto[];
}

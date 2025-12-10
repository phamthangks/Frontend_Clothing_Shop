import { Product } from './product.dto';

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
  productId: number;
  product?: Product;
}

export interface ProductVariantCreateRequest {
  productId: number;
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
}

export interface ProductVariantUpdateRequest {
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
}

export interface VariantData {
  color: string;
  size: string;
  price: number;
  stockQuantity: number;
}

export interface ProductVariantBatchCreateRequest {
  productId: number;
  variants: VariantData[];
}



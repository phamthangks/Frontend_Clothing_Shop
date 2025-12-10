import { Product } from './product.dto';

export interface ProductImage {
  id: number;
  productId?: number;
  imageUrl?: string;
  product?: Product;
}

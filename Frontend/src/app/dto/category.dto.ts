import { Product } from './product.dto';

export interface Category {
  id: number;
  name: string;
  products?: Product[];
}

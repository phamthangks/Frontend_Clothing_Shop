import { Product } from './product.dto';

export interface Brand {
  id: number;
  name: string;
  products?: Product[];
}

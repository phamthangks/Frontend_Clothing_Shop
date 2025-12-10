import { Order } from './order.dto';
import { Product } from './product.dto';
import { ProductVariant } from './productVariant.dto';

export interface OrderDetail {
  id: number;
  orderId?: number;
  productId?: number;
  price?: number;
  numberOfProducts?: number;
  totalMoney?: number;
  productVariantId?: number;
  order?: Order;
  product?: Product;
  productVariant?: ProductVariant;
}

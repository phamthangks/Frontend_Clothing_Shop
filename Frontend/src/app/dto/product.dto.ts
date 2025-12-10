import { Brand } from './brand.dto';
import { Category } from './category.dto';
import { OrderDetail } from './orderDetail.dto';
import { ProductImage } from './productImage.dto';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  categoryId?: number;
  image?: string;
  brandId?: number;
  brand?: Brand;
  category?: Category;
  orderDetails?: OrderDetail[];
  productImages?: ProductImage[];
}

import { OrderDetail } from './orderDetail.dto';
import { User } from './user.dto';

export interface Order {
  id: number;
  userId?: number;
  fullname?: string;
  email?: string;
  phoneNumber: string;
  address: string;
  note?: string;
  orderDate?: Date;
  status?: string;
  totalMoney?: number;
  shippingMethod?: string;
  shippingDate?: Date;
  trackingNumber?: string;
  paymentMethod?: string;
  active?: boolean;
  isQuickPurchase: boolean;
  orderDetails?: OrderDetail[];
  user?: User;
}

import { User } from './user.dto';

export interface ShippingAddress {
  id: number;
  userId: number;
  address: string;
  phoneNumber: string;
  isDefault?: boolean;
  fullname?: string;
  user?: User;
}

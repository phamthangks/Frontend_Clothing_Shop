import { Order } from './order.dto';
import { Role } from './role.dto';
import { ShippingAddress } from './shippingAddress.dto';
import { SocialAccount } from './socialAccount.dto';
import { Token } from './token.dto';

export interface User {
  id: number;
  fullname?: string;
  phoneNumber: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  dateOfBirth?: Date;
  facebookAccountId?: number;
  googleAccountId?: number;
  roleId?: number;
  orders?: Order[];
  role?: Role;
  shippingAddresses?: ShippingAddress[];
  socialAccounts?: SocialAccount[];
  tokens?: Token[];
}

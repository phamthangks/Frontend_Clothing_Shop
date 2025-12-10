import { User } from './user.dto';

export interface Token {
  id: number;
  tokenType: string;
  token: string;
  userId?: number;
  expirationDate?: Date;
  revoked: boolean;
  expired: boolean;
  user?: User;
}

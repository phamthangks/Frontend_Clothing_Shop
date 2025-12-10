import { User } from './user.dto';

export interface SocialAccount {
  id: number;
  provider: string;
  providerId: string;
  email: string;
  name: string;
  userId?: number;
  user?: User;
}

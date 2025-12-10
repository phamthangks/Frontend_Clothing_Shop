import { User } from './user.dto';

export interface Role {
  id: number;
  name: string;
  users?: User[];
}

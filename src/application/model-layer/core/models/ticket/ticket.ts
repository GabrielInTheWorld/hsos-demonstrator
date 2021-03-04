import { User } from '../user';

export interface Ticket {
  cookie: string;
  token: string;
  user: User;
}

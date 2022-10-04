import { User } from "./user.interface"

export interface Friendship {
  id: number;
  user_emitted: User;
  user_received: User;
  is_accepted: boolean;
  creation_timestamp: Date;
}

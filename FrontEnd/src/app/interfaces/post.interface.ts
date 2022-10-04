import { User } from "./user.interface";

export interface Post {
  id: number;
  comments: Array<Post>;
  parent_id: number;
  post_text: string;
  image_path: string;
  user_owner: User;
  creation_timestamp: Date;
}

import { Post } from "./Post";
import User from "./User";

export interface Like {
    id?: number;
    post_id: number;
    user_id: number;
    created_at: string;

    post?: Post;
    user?: User;
};

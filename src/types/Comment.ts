import { Post } from "./Post";
import User from "./User";

export interface Comment {
    id?: number;
    post_id: number;
    user_id: number;
    comment: string;
    created_at: string;

    post?: Post;
    user?: User;
};

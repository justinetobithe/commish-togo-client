import { Post } from "./Post";
import { Resume } from "./Resume";
import User from "./User";

export interface JobApplication {
    id?: number;
    post_id?: number;
    user_id?: number;
    resume_id?: number;
    cover_letter?: string;
    status?: string;

    created_at?: string;

    post?: Post;
    user?: User;
    resume?: Resume;
}
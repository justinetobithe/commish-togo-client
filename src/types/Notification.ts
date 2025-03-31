import User from "./User";

export interface Notification {
    id?: number;
    user_id: number;
    title?: string;
    body?: string;
    action_url?: string;
    created_at: string;

    user?: User
}
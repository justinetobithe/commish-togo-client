import User from "./User";

export interface Profile {
    id?: number;
    user_id: number;
    brief_description?: string | null; 
    bio?: string | null;
    skills?: string | null;
    portfolio_url?: string | null;
    hourly_rate?: string | null;
    availability?: string | null;

    user?: User;
}

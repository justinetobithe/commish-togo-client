import User from "./User";

export interface WorkExperience {
    id?: number;
    user_id: number;
    company_name?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    is_current?: boolean;

    user?: User;
}

import User from "./User";

export interface EducationalAttainment {
    id?: number;
    user_id: number;
    institution_name: string;
    degree?: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    description?: string;
    is_current: boolean;

    user?: User;
}

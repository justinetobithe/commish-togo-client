import User from "./User";

export interface Resume {
    id?: number;
    user_id?: number;
    file_name?: string;
    file_path?: string;
    file_type?: string;
    file_size?: number;

    file?: File;
    user?: User;
}

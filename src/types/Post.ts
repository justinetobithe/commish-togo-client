import { Comment } from "./Comment";
import { File } from "./File";
import { JobApplication } from "./JobApplication";
import { Like } from "./Like";
import { Service } from "./Service";
import User from "./User";

export interface Post {
    id?: number;
    uuid?: string;
    user_id?: number;
    title: string;
    content?: string;
    location?: string;
    salary?: string;
    type?: string;
    posted_date?: string;
    application_deadline?: string | null | Date;
    is_hidden?: boolean;
    created_at?: string;

    service_id?: number[]
    services?: Service[];

    user?: User;
    likes?: Like[];
    comments?: Comment[];
    files?: File[];
    applicants?: JobApplication[];
    tags?: Service[];
};

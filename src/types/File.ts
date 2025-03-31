export interface File {
    id?: number;
    post_id: number;
    name: string;
    path?: string;
    mime_type?: string;
    size?: number;
    created_at: string;
}

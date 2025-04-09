export default interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        user: string;
        message: string;
        created_at: string;
    };
    read_at: string | null; 
    created_at: string;
    updated_at: string;
}

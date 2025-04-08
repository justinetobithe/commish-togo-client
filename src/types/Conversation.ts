import { Message } from "./Message";
import User from "./User";

export interface Conversation {
    id?: number;
    user_one_id?: number;
    user_two_id?: number;

 
    latest_message?: string;
    last_message_time?: string;

    user_one?: User;
    user_two?: User;

    messages?: Message[];

};

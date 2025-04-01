import User from "./User";

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  created_at: string;

  latest_message?: string;
  last_message_time?: string;

  sender?: User;
  recipient?: User;
}

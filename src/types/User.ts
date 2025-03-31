import { Resume } from "./Resume";

// MAIN
export default interface User {
  id: number | string | null;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  // dob?: string;
  image?: string | null;
  role: string;
  token?: string;
  email_verified?: Date | null;
  status?: number;
  student_id?: string | null;

  resumes?: Resume[]; 

}


export interface UserPaginatedData {
  data: User[];
  last_page: number;
}

// STATE
export interface UserStateDefinition {
  data: User | null;
}

// ACTIONS
export interface UserStateActions {
  setUser: (user: User) => void;
}

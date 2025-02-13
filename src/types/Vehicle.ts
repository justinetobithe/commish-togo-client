import { Driver } from "./Driver";
import User from "./User";

export interface Vehicle {
    id?: number;
    driver_id?: number;
    license_plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    capacity?: string;

    driver?: Driver

    remaining_capacity?: string

}

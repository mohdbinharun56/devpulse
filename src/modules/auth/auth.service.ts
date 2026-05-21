import { pool } from "../../database/index.db";
import type { IAuthSignup } from "./auth.interface";

const signupIntoDB = (signupData: IAuthSignup) => {
    const {name,email,password,role} =signupData;

    const result = pool.query(`
    INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *`,[name,email,password,role]);
    
    return result;
}
export const authService = {
    signupIntoDB,
}


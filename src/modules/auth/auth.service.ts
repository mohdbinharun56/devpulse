import { pool } from "../../database/index.db";
import type { IAuthSignup } from "./auth.interface";
import bcrypt from "bcrypt";

const signupIntoDB = async (signupData: IAuthSignup) => {
    const {name,email,password,role} =signupData;

    const hashPassword = await bcrypt.hash(password, 12);

    const result = pool.query(`
    INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *`,[name,email,hashPassword,role]);
    
    return result;
}
export const authService = {
    signupIntoDB,
}


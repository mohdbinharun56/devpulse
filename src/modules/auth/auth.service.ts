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


const loginIntoDB = async (loginData: any)=>{
    // console.log(loginData);
    const {email, password} = loginData;

    const isUserExist = await pool.query(`
    SELECT * FROM users WHERE email = $1
    `,[email]);

    // console.log(isUserExist);
    if(isUserExist.rows.length === 0){
        throw new Error("Invalid credentials!");
    }

    const user = isUserExist.rows[0];

    const matchPassword = bcrypt.compare(password,user.password);

    if(!matchPassword){
        throw new Error("Invalid credentials!");
    }

    delete user.password;

    return {user};
}

export const authService = {
    signupIntoDB,
    loginIntoDB
}


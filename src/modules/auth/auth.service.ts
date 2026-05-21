import config from "../../config";
import { pool } from "../../database/index.db";
import type { IAuthLogin, IAuthSignup } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signupIntoDB = async (signupData: IAuthSignup) => {
    const {name,email,password,role} =signupData;

    const hashPassword = await bcrypt.hash(password, 12);

    const result = pool.query(`
    INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *`,[name,email,hashPassword,role]);
    
    return result;
}


const loginIntoDB = async (loginData: IAuthLogin)=>{
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
    // console.log(user);

    const matchPassword = await bcrypt.compare(password,user.password);
    // console.log("Match Password is: ", matchPassword);

    if(!matchPassword){
        throw new Error("Invalid credentials!");
    }

    // generate accessToken
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const accessToken = await jwt.sign(payload,config.jwt_secret as string, {expiresIn: "1d"});

    delete user.password;

    return {
        token: accessToken,
        user
    };
}

export const authService = {
    signupIntoDB,
    loginIntoDB
}


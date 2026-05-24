import type { Request, Response } from "express"
import SendResponse from "../../utilities/SendResponse"
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) =>{
    try {
        const signupData = req.body;

        const result = await authService.signupIntoDB(signupData);

        if(result.rows.length === 0){
            return SendResponse(res,400,false,"User registration failed");
        }

        delete result.rows[0].password;

        return SendResponse(res,201,true,"User registered successfully", result.rows[0]); 
    } catch (error: any) {
       return SendResponse(res,500,false,error.message,error);
    }
}

const login = async (req: Request, res: Response)=>{
    try {
        const loginData = req.body;

        const result = await authService.loginIntoDB(loginData);

        return SendResponse(res,200,true,"Login successful",result);

    } catch (error: any) {
        return SendResponse(res,500,false,error.message,error);
    }
}
export const authController = {
 signup,
 login
}
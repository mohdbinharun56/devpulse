import type { Request, Response } from "express"
import SendResponse from "../../utilities/SendResponse"
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) =>{
    try {
        const signupData = req.body;

        const result = await authService.signupIntoDB(signupData);
        if(result.rows.length === 0){
            return SendResponse(res,401,false,"Unathorized!!");
        }
        delete result.rows[0].password;
        return SendResponse(res,200,true,"User registered successfully", result.rows[0]); 
    } catch (error: any) {
       return SendResponse(res,500,false,error.message,error);
    }
}

export const authController = {
 signup,

}
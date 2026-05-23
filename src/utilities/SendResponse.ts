import type { Response } from "express"

const SendResponse = (res: Response, statusCode: number, success: boolean, message?: string, data?: any,error?:any)=>{
    res.status(statusCode).json({
        success,
        message,
        data,
        error
    })
}

export default SendResponse;
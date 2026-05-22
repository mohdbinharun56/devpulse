import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from "express"
import SendResponse from "../utilities/SendResponse";
import config from '../config';
import { pool } from '../database/index.db';

const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log(req.headers.authorization);
            const token = req.headers.authorization;

            if (!token) {
                return SendResponse(res, 401, false, "Unathorized access!");
            }


            const decoded = await jwt.verify(token, config.jwt_secret as string) as JwtPayload;

            // console.log(decoded)

            const verifyUser = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [decoded.email]);

            // console.log(verifyUser);

            const user = verifyUser.rows[0];
            if (!user) {
                return SendResponse(res, 404, false, "User not found!");
            }

            req.user = decoded;

            // RBAC
            if (roles.length && !roles.includes(user.role)) {
                return SendResponse(res, 403, false, "Forbidden!!");
            }

            next();
        } catch (error: any) {
            SendResponse(res,500,false,error.message,error)
            next(error);
        }
    }
}


export default auth;
import config from "../../config";
import { pool } from "../../database/index.db";
import type { IIssues } from "./issues.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";

const createIssueIntoDB = async (issueData: IIssues, token: string)=> {
    const {title, description, type} = issueData;

    if(!token){
        throw new Error("Unauthorized access!");
    }

    const decoded = await jwt.verify(token,config.jwt_secret as string) as JwtPayload;

    if(!decoded){
        throw new Error("Unauthorized!!");
    }
    
    // console.log("decoded: ",decoded.id);
    const reporter_id = decoded.id;

    const result = pool.query(`
    INSERT INTO issues(title,description,type,reporter_id) VALUES ($1,$2,$3,$4)
    RETURNING *`,[title,description,type,reporter_id]);
    
    return result;
    
}


export const issuesService = {
    createIssueIntoDB,
} 
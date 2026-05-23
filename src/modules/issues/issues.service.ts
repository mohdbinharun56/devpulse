import config from "../../config";
import { pool } from "../../database/index.db";
import type { IIssues, IReporter } from "./issues.interface";
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


const getAllIssues = async (orderBy: string) =>{
    const issuesResult = await pool.query(`
    SELECT * FROM issues ORDER BY created_at ${orderBy}`);
    
    const allIssues = issuesResult.rows;

    if(!allIssues){
        throw new Error(`Issues not found`);
    }

    // console.log("issue Results: ",allIssues);

    const reporterIDs = allIssues.map((issue: any)=>issue.reporter_id)
    // console.log("Reporter IDs: ",reporterIDs);

    const reporters = await pool.query(`
    SELECT id, name, role FROM users WHERE id = ANY($1) 
    `,[reporterIDs]);

    // console.log("Users ",reporters.rows)

    const reporterMap = new Map();
    // console.log("Reporter Map: ",reporterMap);

    reporters.rows.forEach((reporter: IReporter )=>{
        reporterMap.set(reporter.id,reporter);
    });

    // console.log("reporters",reporters);
    // console.log("reporter map after set: ",reporterMap);

    const formattedIssue = allIssues.map((issue:any)=>({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterMap.get(issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at
    }));

    // console.log(formattedIssue);
    return formattedIssue;
}

const getSingleIssue = (id: string)=>{

}

export const issuesService = {
    createIssueIntoDB,
    getAllIssues,
    // getSingleIssue,
} 
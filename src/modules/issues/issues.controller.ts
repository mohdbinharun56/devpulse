import type { Request, Response } from "express"
import SendResponse from "../../utilities/SendResponse";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response)=>{
    try {
        const issueData = req.body;
        // console.log("headers-> authoriztion-> issuesController",req.headers.authorization);
        const authorization = req.headers?.authorization;

        const result = await issuesService.createIssueIntoDB(issueData, authorization as string);

        if(result.rows.length === 0){
            return SendResponse(res,404,false,"Not Found!")
        }

        return SendResponse(res,201,true,"Issue created successfully", result.rows[0])


    } catch (error: any) {
        return SendResponse(res,500,false,error.message,error);
    }
}

const getAllIssues = async (req: Request, res: Response)=>{
    try {
        const allowedSort = ["newest","oldest"];
        
        const {sort} = req.query; // "newest" || "oldest" 
        // console.log("Request query: ",sort);

        const sortQuery = allowedSort.includes(sort as string) ? sort : allowedSort[0];
        
        // console.log("sort",sortQuery);

        let orderBy = 'DESC';

        if(sortQuery === 'oldest'){
            orderBy = 'ASC';
        }

        // console.log("order", orderBy)
        const result = await issuesService.getAllIssues(orderBy);

        if(result.length === 0){
            return SendResponse(res,404,false,"Isseus empty!",[]);
        }
        return SendResponse(res,200,true,"Retrive all issues",result);
    } catch (error: any) {
        return SendResponse(res,500,error.message,error)
    }
}


export const issuesController = {
    createIssue,
    getAllIssues

}
import type { Request, Response } from "express"
import SendResponse from "../../utilities/SendResponse";
import { issuesService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
    try {
        const issueData = req.body;
        // console.log("headers-> authoriztion-> issuesController",req.headers.authorization);
        const authorization = req.headers?.authorization;

        const result = await issuesService.createIssueIntoDB(issueData, authorization as string);

        if (result.rows.length === 0) {
            return SendResponse(res, 400, false, "Issue creation failed");
        }

        return SendResponse(res, 201, true, "Issue created successfully", result.rows[0])


    } catch (error: any) {
        return SendResponse(res, 500, false, error.message, error);
    }
}

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const allowedSort = ["newest", "oldest"];

        const { sort } = req.query; // "newest" || "oldest" 
        // console.log("Request query: ",sort);

        const sortQuery = allowedSort.includes(sort as string) ? sort : allowedSort[0];

        // console.log("sort",sortQuery);

        let orderBy = 'DESC';

        if (sortQuery === 'oldest') {
            orderBy = 'ASC';
        }

        // console.log("order", orderBy)
        const result = await issuesService.getAllIssues(orderBy);

        if (result.length === 0) {
            return SendResponse(res, 200, true, "No issues found", []);
        }
        return SendResponse(res, 200, true, "Issues retrieved successfully", result);
    } catch (error: any) {
        return SendResponse(res, 500, error.message, error)
    }
}

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await issuesService.getSingleIssue(id as string);

        if (!result) {
            return SendResponse(res, 404, false, "Issue not found");
        }

        return SendResponse(res, 200, true, "Retrive single issue", result);
    } catch (error: any) {
        return SendResponse(res, 500, false, error.message, error)
    }
}


const updateIssue = async (req: Request, res: Response) => {
    try {
        // console.log(req.user);
        const user = req.user;
        const updatedIssueData = req.body;
        const { id } = req.params;

        const result = await issuesService.updateIssue(updatedIssueData, user, id as string);
        if (result.rows.length === 0) {
            return SendResponse(res, 400, false, "Issue update failed");
        }
        return SendResponse(res, 200, true, "Issue updated successfully", result.rows[0]);
    } catch (error: any) {
        return SendResponse(res, 500, false, error.message, error);
    }

}

const deleteIssue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // console.log(req.user);
        const result = await issuesService.deleteIssue(id as string);
        console.log("Controller Delete: ", result);
        if (result.rowCount !== 1) {
            return SendResponse(res,404,false,"Issue not found");
        }
        return SendResponse(res, 200, true, "Issue deleted successfully");
    } catch (error: any) {
        return SendResponse(res, 500, false, error.message, error);
    }
}

export const issuesController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}
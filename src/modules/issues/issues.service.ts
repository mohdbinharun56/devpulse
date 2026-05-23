import { title } from "node:process";
import config from "../../config";
import { pool } from "../../database/index.db";
import type { IIssues, IReporter } from "./issues.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UserRole } from "../../types/user.type";

const createIssueIntoDB = async (issueData: IIssues, token: string) => {
    const { title, description, type } = issueData;

    if (!token) {
        throw new Error("Unauthorized access!");
    }

    const decoded = await jwt.verify(token, config.jwt_secret as string) as JwtPayload;

    if (!decoded) {
        throw new Error("Unauthorized!!");
    }

    // console.log("decoded: ",decoded.id);
    const reporter_id = decoded.id;

    const result = pool.query(`
    INSERT INTO issues(title,description,type,reporter_id) VALUES ($1,$2,$3,$4)
    RETURNING *`, [title, description, type, reporter_id]);

    return result;

}


const getAllIssues = async (orderBy: string) => {
    const issuesResult = await pool.query(`
    SELECT * FROM issues ORDER BY created_at ${orderBy}`);

    const allIssues = issuesResult.rows;

    if (!allIssues) {
        throw new Error(`Issues not found`);
    }

    // console.log("issue Results: ",allIssues);

    const reporterIDs = allIssues.map((issue: any) => issue.reporter_id)
    // console.log("Reporter IDs: ",reporterIDs);

    const reporters = await pool.query(`
    SELECT id, name, role FROM users WHERE id = ANY($1) 
    `, [reporterIDs]);

    // console.log("Users ",reporters.rows)

    const reporterMap = new Map();
    // console.log("Reporter Map: ",reporterMap);

    reporters.rows.forEach((reporter: IReporter) => {
        reporterMap.set(reporter.id, reporter);
    });

    // console.log("reporters",reporters);
    // console.log("reporter map after set: ",reporterMap);

    const formattedIssue = allIssues.map((issue: any) => ({
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

const getSingleIssue = async (id: string) => {
    // console.log(id);
    const result = await pool.query(`
    SELECT * FROM issues WHERE id = $1
    `, [id]);
    // console.log(result);
    if (result.rows.length === 0) {
        throw new Error("Issue not found");
    }
    delete result.rows[0].password;

    const issue = result.rows[0];
    // console.log("Issue: ",issue);

    const reporterID = issue.reporter_id;

    // console.log(reporterID)
    const reporter = await pool.query(`
    SELECT id, name, role FROM users WHERE id = $1
    `, [reporterID]);

    // console.log("Reporter: ",reporter)

    const reporterMap = new Map();

    reporter.rows.forEach((reporter: IReporter) => {
        reporterMap.set(reporter.id, reporter);
    })

    // console.log(reporterMap);

    const formattedIssue = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterMap.get(issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at
    }
    // console.log("Formatted issue", formattedIssue)
    return formattedIssue;
}


const updateIssue = async (payload: IIssues, user: any, id: string) => {
    // console.log(payload);
    // console.log("User-Service: ", user);
    // console.log("Issue-ID: ", id);

    const { title, description, type } = payload;
    const issue = await getSingleIssue(id);
    // console.log("issue with ID: ",issue);

    // console.log(user.role);

    if (issue.status !== 'open') {
        throw new Error("Issues is already Updated.");
    }

    const status = "in_progress";
    const updated_at = new Date();

    if (user.role === UserRole.maintainer) {
        const result = await pool.query(`
        UPDATE issues SET title = COALESCE($1,title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status), 
        updated_at = COALESCE($5,updated_at) WHERE id = $6 RETURNING *`, [title, description, type, status, updated_at, id]);

        // console.log("Maintainer Result: ",result);
        return result;
    }

    // contributor can only updated own issue:
    if (user.id !== issue.reporter.id) {
        throw new Error(`Unauthorized! Does not have permission!`);
    }

    const result = await pool.query(`
    UPDATE issues SET title = COALESCE($1,title), description = COALESCE($2, description), type = COALESCE($3, type), status = COALESCE($4, status), 
    updated_at = COALESCE($5,updated_at) WHERE id = $6 RETURNING *`, [title, description, type, status, updated_at, id]);

    // console.log("Contributor: ",result);
    return result;

}
export const issuesService = {
    createIssueIntoDB,
    getAllIssues,
    getSingleIssue,
    updateIssue
} 
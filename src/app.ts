import express, { type Request, type Response } from "express";
import { authRouter } from "./modules/auth/auth.route";
import { issuesRouter } from "./modules/issues/issues.route";
export const app = express();

app.use(express.json());

// Authentication
app.use('/api/auth',authRouter);

// Issues module
app.use('/api/issues',issuesRouter);




app.get('/',(req: Request,res: Response)=>{
    // console.log("This is the Devpulse root");
    res.send("This is the root of Devpulse")
});
import express, { type Request, type Response } from "express";
import { authRouter } from "./modules/auth/auth.route";

export const app = express();

app.use(express.json());

// Authentication
app.use('/api/auth',authRouter);





app.get('/',(req: Request,res: Response)=>{
    // console.log("This is the Devpulse root");
    res.send("This is the root of Devpulse")
});
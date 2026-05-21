import express, { type Request, type Response } from "express";

export const app = express();

app.use(express.json());


app.get('/',(req: Request,res: Response)=>{
    // console.log("This is the Devpulse root");
    res.send("This is the root of Devpulse")
});
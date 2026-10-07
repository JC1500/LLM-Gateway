import express from "express";
import {env} from "./config/schema.js";

const app=express();

app.get('/healthz',(req,res)=>{
    return res.status(200).json({
        message:"All Good"
    })
});


export default app;
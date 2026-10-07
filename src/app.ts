import express from "express";


const app=express();

app.get('/healthz',(req,res)=>{
    return res.status(200).json({
        message:"All Good"
    })
});


export default app;
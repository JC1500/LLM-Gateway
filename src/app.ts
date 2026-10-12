import express from "express";
import helmet from 'helmet';  // used for setting the data limit to be send
import {requestIDMiddleware} from "./middleware/requestID.js";
import {errorhandler} from "./middleware/ErrorHandler.js";
import {pinoHttp} from "pino-http";
import { logger } from "./lib/logger.js";
import { AppError } from "./lib/errors.js";


const app=express();

app.use(helmet());
app.use(express.json({
    limit:"1mb"
})); //sets the limit to 1MB
app.use(express.urlencoded({
    extended:true,
    limit:"1mb"
}));
app.use(requestIDMiddleware);
app.use(pinoHttp({
    logger,
    genReqId:(req)=>{return req.requestId},
}));
// add routes...

app.get('/healthz',(req,res)=>{
    throw new AppError("HI",400)
    return res.status(200).json({
        message:"All Good"
    })
});

app.use(errorhandler);

export default app;
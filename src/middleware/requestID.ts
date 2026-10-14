import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { logger } from "../lib/logger.js";

export function requestIDMiddleware(req: Request, res: Response, next: NextFunction) {
    const reqid=req.header("X-Request-ID")||uuid();
    req.requestId=reqid;
    req.logger=logger.child({reqid});
    res.setHeader("X-Request-ID",reqid);
    next();
}
import type { Response, Request, NextFunction } from "express";
import { z } from "zod";

export const validate = <T>(schema: z.ZodType<T>) => (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const result = schema.safeParse(req.body??{});

    if (!result.success) {
        req.logger.info({error:result.error},"Data is not is correct format");
        return res.status(400).json({
            success: false,
            requestID: req.requestId,
            error:{
                message: result.error.issues.map((issue) => issue.message).join(", "),
            },
        });
    }
    
    req.body=result.data;
    next();
};
import express from "express";
import helmet from "helmet";
import { requestIDMiddleware } from "./middleware/requestID.js";
import { errorhandler } from "./middleware/ErrorHandler.js";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import authrouter from "./routes/auth.routes.js";
import chatrouter from "./routes/chat.routes.js";

const app = express();

app.use(helmet());
app.use(
    express.json({
        limit: "1mb",
    }),
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb",
    }),
);
app.use(requestIDMiddleware);
app.use(
    pinoHttp({
        logger,
        genReqId: (req) => req.requestId,
    }),
);

app.get("/healthz", (req, res) => {
    return res.status(200).json({
        message: "All Good",
    });
});

app.use(errorhandler);

export default app;
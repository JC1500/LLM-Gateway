import express from "express";
import helmet from "helmet";
import { requestIDMiddleware } from "./middleware/requestID.js";
import { errorhandler } from "./middleware/ErrorHandler.js";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import authrouter from "./routes/auth.routes.js";
import chatrouter from "./routes/chat.routes.js";
import modelsrouter from './routes/models.routes.js';
import { redis } from "./cache/redis.js";
const app = express();

app.use(requestIDMiddleware);
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

app.get("/health", async (req, res) => {
  let redisStautus=true;
  try{
    await redis.ping();
  }catch(error){
    redisStautus=false;
    logger.warn("Redis not Connected")
  }
  return res.status(200).json({
    message: "All Good",
    services:{
      redis:redisStautus? "Connectedd":"Not Connected",
    },
  });
});
app.use(authrouter);
app.use("/v1",modelsrouter)
app.use("/chat", chatrouter);
app.use(errorhandler);

export default app;
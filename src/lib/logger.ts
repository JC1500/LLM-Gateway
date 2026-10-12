import {pino} from "pino";
import {env} from "../config/env.schema.js";

export const logger=pino({
    level: env.LOG_LEVEL,
});
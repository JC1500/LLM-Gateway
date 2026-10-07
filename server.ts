import app from "./src/app.js";
import {env} from "./src/config/schema";

app.listen(env.PORT,()=>{
    console.log(`Started server at ${env.PORT}`)
})
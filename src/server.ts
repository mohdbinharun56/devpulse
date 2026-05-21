import { app } from "./app"
import config from "./config"
import initDB from "./database/index.db"

const main = () =>{
    initDB();
    app.listen(config.port,()=>{
        console.log(`🔥 The server is running on port: ${config.port}`);
    })
}

main();
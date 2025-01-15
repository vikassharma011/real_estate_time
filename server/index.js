import express from "express" ;
import cors from "cors" ;
import dbconnect from "./util/db.js";
import { auth } from "./Routes/Auth.js";

const app = express() ; 
app.use(cors()) ;
app.use(express.json());

app.use('/auth' , auth) ; 

const port = process.env.PORT || 5004;
app.listen(port , ()=>{
    console.log(`server is running ${port}`)
})




dbconnect() ;
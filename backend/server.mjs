import express from "express"
import path from "path"
import cors from "cors"
import { HomeController } from "./controllers/HomeController.mjs"
import { BookingController } from "./controllers/BookingController.mjs"
import { UserMngController } from "./controllers/UserMngController.mjs"
import { AuthenticationController } from "./controllers/AuthenicationController.mjs"
import { SessionController } from "./controllers/SessionController.mjs"
import { PostController } from "./controllers/PostController.mjs"
import { RegisterController } from "./controllers/RegisterController.mjs"
import { SessionMngController } from "./controllers/SessionMngController.mjs"
import { TrainerController } from "./controllers/TrainerController.mjs"
import { BookingMngController } from "./controllers/BookingMngController.mjs"
import { LocationMngController } from "./controllers/LocationMngController.mjs"
import { ActivityMngController } from "./controllers/ActivityMngController.mjs"
import { APIController } from "./controllers/api/APIController.mjs"





const app = express()
const port = 8080

//Enable cross-origin receources sharing (CORS) and preflight Options requests
app.use(
    cors({
        origin: true 
        // origin: "https://connect.tafeqld.edu.au"
    })
)


app.set("view engine", "ejs")
app.set("views", path.join(import.meta.dirname,"views"))

//order matters ....body parser ...> middleware..> controller
//Middleware setup
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(AuthenticationController.middleware)


// use routes (from controllers)
app.use("/sessions", SessionController.routes)
app.use("/bookings", BookingController.routes)
app.use("/users", UserMngController.routes)
app.use("/authenticate", AuthenticationController.routes)
app.use("/register", RegisterController.routes)
app.use("/posts", PostController.routes)
app.use("/trainer", TrainerController.routes)
app.use("/session_mng",SessionMngController.routes)
app.use("/booking_mng",BookingMngController.routes)
app.use("/location_mng", LocationMngController.routes)
app.use("/activity_mng", ActivityMngController.routes)
app.use("/", HomeController.routes)
app.use("/api",APIController.routes)

app.use(express.static(path.join(import.meta.dirname,"public")))



app.get("/", (req,res)=>{
    //  res.status(301).redirect("/sessions")
})
app.listen(port,()=>{
    console.log("Backend started on http://localhost:"+port)
})


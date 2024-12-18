import cookieParser from "cookie-parser"; // To access and set cookies of users browser
import cors from "cors"; // validate incoming and outgoing from the server
import express from "express";
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "20kb"})) // set limit for incoming json data
app.use(express.urlencoded({extended:true,limit:"20kb"}))// encodes the url and sets limit for it
app.use(express.static("public"))
app.use(cookieParser())

export { app };

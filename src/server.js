import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDB } from './database/index.js';
import authorizeAccess from "./middlewares/auth.middleware.js";
import subTodoRoutes from './routes/subtodo.router.js';
import todoRoutes from './routes/todo.router.js';
import userRoutes from './routes/user.router.js';
import ApiResponse from './utils/ApiResponse.js';
// require('dotenv').config({path:'./env'})

dotenv.config({
    path:'./env'
})

const port = (process.env.PORT)?  process.env.PORT : 8000 ;

connectDB()
.then(()=>{
    const server = http.createServer(app)

    server.on('error',(error) => {
        console.log(`State - launching app! Description - ${error}`);
    })

    server.on("connection", (socket) => {
        console.log(`New Connection Established!`)
    })

    server.listen(port,()=>{
        console.log(`App listening on port : ${port}`);
    })
})
.catch((error)=>{
    console.log(`App connection error! ${error}`);
})
    
app.get('/',(req,res)=>  res.status(200).json(
    new ApiResponse(
        201,
        {msg: "Welcome to ToDo HomePage!"},
        `App Listening on port - ${port}`)
        )
    )

app.use('/api/userRoutes',userRoutes)
app.use('/api/user/todoRoutes',authorizeAccess,todoRoutes)
app.use('/api/user/subTodoRoutes',authorizeAccess,subTodoRoutes)

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json(new ApiResponse(404, null, 'Route not found'));
});
  
  // Error handling middleware (optional, for catching all errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(new ApiResponse(500, null, 'Internal Server Error'));
});
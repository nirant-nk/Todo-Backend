import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './database/index.js';
import userRoutes from './routes/user.router.js';
import ApiResponse from './utils/ApiResponse.js';
// require('dotenv').config({path:'./env'})

dotenv.config({
    path:'./env'
})

const port = (process.env.PORT)?  process.env.PORT : 8000 ;

connectDB()
.then(()=>{
    app.on('error',(error) => {
        console.log(`App error: state - launching app! Description - ${error}`);
    })
    app.listen(port,()=>{
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
app.use('/api/todoRoutes',todoRoutes)
app.use('/api/subTodoRoutes',subTodoRoutes)
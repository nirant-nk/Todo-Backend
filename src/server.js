import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './database/index.js';
import subTodoRoutes from './routes/sub-todoes.router.js';
import todoRoutes from './routes/todoes.router.js';
import userRoutes from './routes/user.router.js';
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
    

app.use('/api/userRoutes',userRoutes)
app.use('/api/todoRoutes',todoRoutes)
app.use('/api/subTodoRoutes',subTodoRoutes)
import mongoose, { Schema } from "mongoose";

// Define the Fullname schema as a subdocument
const subTodoSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'subTodo Title Here'
    },
    isCompleted:{
        type: Boolean,
        required:true,
        default: false
    }
});


const SubTodo = mongoose.model("SubTodo", subTodoSchema);

export { SubTodo };

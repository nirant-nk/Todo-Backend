import mongoose, { Schema } from "mongoose";

// Define the Fullname schema as a subdocument
const todoSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'Todo Title Here'
    },
    subTodoes:[{
        type: Schema.Types.ObjectId,
        ref: 'SubTodo'
    }],
    isCompleted:{
        type: Boolean,
        required:true,
        default: false
    }
});


const Todo = mongoose.model("Todo", todoSchema);

export { Todo };

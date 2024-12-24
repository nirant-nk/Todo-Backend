import mongoose, { Schema } from "mongoose";

// Define the Fullname schema as a subdocument
const subTodoSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: "subTodo Title Here",
    },
    isCompleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    todoId: { // A left join type of relationship - efficient for operations
        type: Schema.Types.ObjectId,
        ref: "Todo",
        required: true,
    },
});

// After every post called on SubTodo it checks 
// if all subTodoes are completed if true then marke= mainTodo as completed
subTodoSchema.post("findOneAndUpdate", async function (subTodo) {
    if (subTodo) {
        const subTodos = await mongoose.model("SubTodo").find({ todoId: subTodo.todoId });

        const allCompleted = subTodos.every(
            (subTodoes) => subTodoes.isCompleted
        );

        await mongoose.model("Todo")
        .findByIdAndUpdate(
            doc.todoId, 
            { 
                isCompleted: allCompleted 
            },
            {
                new: true
            }
        );
    }
});



const SubTodo = mongoose.model("SubTodo", subTodoSchema);

export { SubTodo };

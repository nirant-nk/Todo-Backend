import mongoose from "mongoose";

// Define the Fullname schema as a subdocument
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Ensures every Todo is linked to a User
    },
}, {
    timestamps: true,
});

todoSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();

    if (update.isCompleted !== undefined) {
        const todo = await this.model.findOne(this.getQuery());

        if (todo) {
            await mongoose.model("SubTodo").updateMany(
                { todoId: todo._id },
                { isCompleted: update.isCompleted }
            );
        }
    }
});


const Todo = mongoose.model("Todo", todoSchema);

export { Todo };

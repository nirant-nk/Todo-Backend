import { SubTodo } from '../models/subtodo.model.js';
import { Todo } from '../models/todo.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';


// Create a SubTodo
const createSubTodo = asyncHandler(async (req, res) => {
    try {
        const { title } = req.body;
        const { todoId } = req.params;
    
        if (!title?.trim() || !todoId) {
            throw new ApiError(400, 'Title and associated Todo ID are required to create a SubTodo');
        }
    
        const userId = req.userID;
    
        // Ensure the parent Todo belongs to the user
        const parentTodo = await Todo.findOne({ _id: todoId, userId });
        if (!parentTodo) {
            throw new ApiError(404, 'Parent Todo not found or unauthorized');
        }
    
        const newSubTodo = await SubTodo.create({ title, todoId });
    
        if(!newSubTodo){
            throw new ApiError(
                502,
                "Something Went Wrong While Creating a subTodo. Please Try Again!"
            )
        }
        
        res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newSubTodo, 
                'SubTodo created successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - subTodo Creation | ERROR - ${error} `
            )
        )
    }
});

// Get SubTodos for a Todo
const getSubTodos = asyncHandler(async (req, res) => {
    try {
        const { todoId } = req.params;
        const userId = req.userID;
    
        // Ensure the parent Todo belongs to the user
        const parentTodo = await Todo.findOne({ _id: todoId, userId });
        if (!parentTodo) {
            throw new ApiError(404, 'Parent Todo not found or unauthorized');
        }
    
        const subTodos = await SubTodo.find({ todoId });
        if(!subTodos){
            throw new ApiError(
                404,
                "No SubTodo Found."
            )
        }
        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                subTodos, 
                'SubTodos retrieved successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - get SubTodo | ERROR - ${error} `
            )
        )
    }
});

// Update a SubTodo
const updateSubTodo = asyncHandler(async (req, res) => {
    try {
        const { todoId, subTodoId } = req.params;
        const { title, isCompleted } = req.body;
    
        if (!title?.trim()) {
            throw new ApiError(400, 'Title is required to update the SubTodo');
        }
    
        const userId = req.userID;
    
        // Ensure the parent Todo belongs to the user
        const subTodo = await SubTodo.findOne({ _id: subTodoId, todoId: todoId }).populate('todoId');
        if (!subTodo || subTodo.todoId.userId.toString() !== userId) {
            throw new ApiError(404, 'SubTodo not found or unauthorized');
        }
    
        subTodo.title = title;
        subTodo.isCompleted = isCompleted;
        await subTodo.save();
    
        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                subTodo, 
                'SubTodo updated successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - Update subTodo | ERROR - ${error} `
            )
        )
    }
});

// Delete a SubTodo
const deleteSubTodo = asyncHandler(async (req, res) => {
try {
        const { todoId, subTodoId } = req.params;
        const userId = req.userID;
    
        // Ensure the parent Todo belongs to the user
        const subTodo = await SubTodo.findOne({ _id: subTodoId, todoId: todoId }).populate('todoId');
        if (!subTodo || subTodo.todoId.userId.toString() !== userId) {
            throw new ApiError(404, 'SubTodo not found or unauthorized');
        }
    
        await subTodo.deleteOne();
    
        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                subTodo, 
                'SubTodo deleted successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - Delete Subtodo | ERROR - ${error} `
            )
        )
    }
});

export {
    createSubTodo,
    deleteSubTodo,
    getSubTodos,
    updateSubTodo
};


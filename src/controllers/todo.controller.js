import { SubTodo } from '../models/subtodo.model.js';
import { Todo } from '../models/todo.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// Create a Todo
const createTodo = asyncHandler(async (req, res,next) => {
    try {
        const { title } = req.body;
    
        if (!title?.trim()) {
            throw new ApiError(400, 'Title is required to create a Todo');
        }
    
        const userId = req.userID ;
    
        const newTodo = await Todo.create({ title, userId });
    
        if(!newTodo){
            throw new ApiError(
                502,
                "Something Went Wrong While Creating a Todo. Please Try Again!"
            )
        }
    
        res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newTodo, 
                'Todo created successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - Todo Creation | ERROR - ${error} `
            )
        )
    }
});

// Get Todos
const getTodos = asyncHandler(async (req, res) => {
    try {
        const userId = req.userID;
    
        const todos = await Todo.find({ userId });

        if(!todos){
            throw new ApiError(
                404,
                "No Todoes Found."
            )
        }
        
        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                todos, 
                'Todos retrieved successfully!'
            )
        );
    } catch (error) {
        res
        .status(200)
        .json(
            new ApiError(
                400,
                `State - getTodoes | ERROR - ${error}`
            )
        )
    }
});

// Update a Todo
const updateTodo = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
    
        if (!title?.trim()) {
            throw new ApiError(400, 'Title is required to update the Todo');
        }
    
        const userId = req.userID;
    
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: id, userId },
            { title },
            { new: true }
        );
    
        if (!updatedTodo) {
            throw new ApiError(404, 'Todo not found or unauthorized');
        }
    
        res.status(200).json(new ApiResponse(200, updatedTodo, 'Todo updated successfully!'));
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                `State - update Todo | ERROR - ${error}`
            )
        )
    }
});

// Delete a Todo
const deleteTodo = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params);
        const userId = req.userID;
    
        const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId });
    
        if (!deletedTodo) {
            throw new ApiError(404, 'Todo not found or unauthorized');
        }
    
        await SubTodo.deleteMany({ todoId: id });
    
        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                deletedTodo, 
                'Todo deleted successfully!'
            )
        );
    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                `State - delete Todo | ERROR - ${error}`
            )
        )
    }
});

export {
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo
};


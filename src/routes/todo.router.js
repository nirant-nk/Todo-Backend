import { Router } from 'express';
import {
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo
} from '../controllers/todo.controller.js';
import getUserID from '../middlewares/getUserID.middleware.js';
import {
    handleValidationErrors,
    validateTodo
} from '../utils/Validator.js';

const router = Router()


// Secured Routes
router.route('/createTodo').post(validateTodo,handleValidationErrors,getUserID,createTodo)
router.route('/getTodos').get(getUserID,getTodos)
router.route('/deleteTodo/:todoId').delete(validateTodo,handleValidationErrors,getUserID,deleteTodo)
router.route('/updateTodo/:todoId').patch(validateTodo,handleValidationErrors,getUserID,updateTodo)

export default router
import { Router } from 'express';
import {
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo
} from '../controllers/todo.controller.js';
import getUserID from '../middlewares/getUserID.middleware.js';

const router = Router()


// Secured Routes
router.route('/createTodo').post(getUserID,createTodo)
router.route('/getTodos').get(getUserID,getTodos)
router.route('/deleteTodo/:todoId').delete(getUserID,deleteTodo)
router.route('/updateTodo/:todoId').patch(getUserID,updateTodo)

export default router
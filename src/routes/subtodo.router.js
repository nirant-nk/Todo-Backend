import { Router } from 'express';
import {
    createSubTodo,
    deleteSubTodo,
    getSubTodos,
    updateSubTodo
} from '../controllers/subtodo.controller.js';
import getUserID from '../middlewares/getUserID.middleware.js';

const router = Router();

// Routes for SubTodo operations
router.route('/createSubTodo/:todoId').post(getUserID, createSubTodo);
router.route('/getSubTodos/:todoId').get(getUserID, getSubTodos); 
router.route('/updateSubTodo/:todoId/:subTodoId').patch(getUserID, updateSubTodo); 
router.route('/deleteSubTodo/:todoId/:subTodoId').delete(getUserID, deleteSubTodo); 

export default router;

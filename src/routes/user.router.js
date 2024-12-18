import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// User controllers for specified routes below here
// Also add middleware for respection route 
// Compulsary Add Authorization middleware

router.post('/register',registerUser);

export default router;
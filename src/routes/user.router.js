import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import authorizeAccess from "../middlewares/auth.middleware.js";

const router = Router();

// User controllers for specified routes below here
// Also add middleware for respection route 
// Compulsary Add Authorization middleware

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes require authorizaion based on access token
router.route('/logout').post(authorizeAccess, logoutUser);

export default router;
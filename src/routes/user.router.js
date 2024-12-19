import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import authorizeAccess from "../middlewares/auth.middleware.js";

const router = Router();

// User controllers for specified routes below here
// Also add middleware for respection route 
// Compulsary Add Authorization middleware

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//secured routes require authorizaion based on access token
router.route('/logout').get(authorizeAccess, logoutUser);
router.route('/refreshAccess').get(authorizeAccess, refreshAccessToken);

export default router;
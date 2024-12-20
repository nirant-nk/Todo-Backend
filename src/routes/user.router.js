import { Router } from "express";
import {
  deleteUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyOTPAndRegister
} from "../controllers/user.controller.js";
import authorizeAccess from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// User controllers for specified routes below here
// Also add middleware for respection route 
// Compulsary Add Authorization middleware

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },  
        { name: 'coverImage', maxCount: 1 }  
      ]),
    registerUser
);
router.route('/verify').post(verifyOTPAndRegister)
router.route('/login').post(loginUser);

//secured routes require authorizaion based on access token
router.route('/logout').get(authorizeAccess, logoutUser);
router.route('/deleteUser').get(authorizeAccess, deleteUser);
router.route('/refreshAccess').get( refreshAccessToken);

export default router;
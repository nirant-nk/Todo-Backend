import { Router } from "express";
import {
  deleteUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendOTP,
  updateDetails,
  verifyOTPAndLogin,
  verifyOTPAndRegister
} from "../controllers/user.controller.js";
import authorizeAccess from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  handleValidationErrors,
  validateLoginUser,
  validateRegisterUser,
  validateResendOTP,
  validateUpdateDetails,
  validateVerifyOTP
} from '../utils/Validator.js';

const router = Router();

// User controllers for specified routes below here
// Also add middleware for respection route 
// Compulsary Add Authorization middleware

// Registration Routes- not secure
router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },  
        { name: 'coverImage', maxCount: 1 }  
      ]),
    validateRegisterUser,
    handleValidationErrors,
    registerUser
);
router.route('/verifyAndRegister').post(validateVerifyOTP,handleValidationErrors,verifyOTPAndRegister)

// Login Routes - not secure
router.route('/login').post(validateLoginUser,handleValidationErrors,loginUser);
router.route('/verifyAndLogin').post(validateVerifyOTP,handleValidationErrors,verifyOTPAndLogin)
router.route('/refreshAccess').get(refreshAccessToken);

// ResendOTP - not secure
router.route('/resendOTP').post(validateResendOTP,handleValidationErrors,resendOTP)

//secured routes require authorizaion based on access token
router.route('/logout').get(authorizeAccess, logoutUser);
router.route('/updateDetails').patch(
  validateUpdateDetails,
  handleValidationErrors,
    authorizeAccess, // Ensure user is authenticated
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    updateDetails 
);
router.route('/deleteUser').get(authorizeAccess, deleteUser);


export default router;
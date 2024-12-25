import { body, validationResult } from "express-validator";
import ApiError from './ApiError.js';

// Registration Validators
const validateRegisterUser = [
  body("fullname").notEmpty().withMessage("Fullname is required"),
  body("username").notEmpty().withMessage("Username is required").isAlphanumeric().withMessage("Username must be alphanumeric"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

// Login Validators
const validateLoginUser = [
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("username").optional().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Update Details Validators
const validateUpdateDetails = [
  body("fullname").optional().isString().withMessage("Fullname must be a string"),
  body("username").optional().isAlphanumeric().withMessage("Username must be alphanumeric"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

// Resend OTP Validators
const validateResendOTP = [
  body("email").isEmail().withMessage("Invalid email"),
];

// Verify OTP Validators
const validateVerifyOTP = [
  body("otp").notEmpty().withMessage("OTP is required"),
  body("email").isEmail().withMessage("Invalid email"),
];


// Validation for Todo model
const validateTodo = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Title is required"),
    body("isCompleted")
        .optional()
        .isBoolean()
        .withMessage("isCompleted must be a boolean")
];

// Validation for SubTodo model
const validateSubTodo = [
    body("title")
        .notEmpty()
        .withMessage("Title is required"),
    body("isCompleted")
        .optional()
        .isBoolean()
        .withMessage("isCompleted must be a boolean")
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res
        .status(400)
        .json(
            new ApiError(
                400,
                `State - Validation | ${errors}`,
            )
        );
    }
    next();
};

export {
    handleValidationErrors,
    validateLoginUser,
    validateRegisterUser,
    validateResendOTP,
    validateSubTodo,
    validateTodo,
    validateUpdateDetails,
    validateVerifyOTP
};


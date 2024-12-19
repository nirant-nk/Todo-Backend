import { OPTIONS } from '../constants.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req,res) =>{
    try {
        const { fullname , username , email , password } = req.body ;    
    
        if(
            [fullname,username,email,password].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400,"All credentials are required!")
        }
    
        const userExist = await User.findOne({
            $or: [{email},{username}]
        })
    
        if(userExist) throw new ApiError(409,"User already Exist!");
    
        const user = await User.create({
            fullname,
            email,
            username,
            password
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser) throw new ApiError(500,"Something went wrong while Registering user!");
    
        await user.save();
    
        res.status(200).json(new ApiResponse(201,createdUser,"User Created!"));
    } catch (error) {
        res.status(500).json(new ApiError(500,`State - Regisration\nServer side error: ${error}`));
    }
})

const loginUser = asyncHandler( async (req,res) => {
    try {
        // Input - take email/username and password from req.body
        const {email,username,password} = req.body;
    
        // Validation - check if any of them is empty !- throw ApiError
        if( !( (email && username) || password) ){
            throw new ApiError(400,`Either email or username is required! Password is always required!`)
        }
    
        // Search in Database - email / username !- throw ApiError
        const user = await User.findOne({
            $or: [{email},{username}]
        })

        if(!user){
            throw new ApiError(404,"User not found!");
        }

        // Verify password using created method in UserSchema !- throw ApiError
        const isPasswordCorrect = await user.verifyPassword(password)

        if(!isPasswordCorrect){
            throw new ApiError(404,"Incorrect Password!")
        }

        // Generate JWT Tokens

        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}) 

        // Remove password and refreshToken from user and send response
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        // Set browser cookies - modifiable only from server not frontend

        res
        .status(200)
        .cookie("accessToken",accessToken,OPTIONS)
        .cookie("refreshToken",refreshToken,OPTIONS)
        .json(
            new ApiResponse(
                201,
                {
                    user: loggedInUser,
                    refreshToken: refreshToken,
                    accessToken: accessToken
                },
                "User Logged in successfully!"
            )
        )

       
    } catch (error) {
        res.status(500).json(new ApiError(500,`State - Login\nServer side error: ${error}`));
    }
} )

const logoutUser = asyncHandler(async (req,res) => {
    try {
        // authorize logged in user using jwt as middleware
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )
        // clear cookies
        return res
        .status(200)
        .clearCookie("accessToken",OPTIONS)
        .clearCookie("refreshToken",OPTIONS)
        .json(
            new ApiResponse(
                201,
                {},
                "User Logged Out!"
            )
        )

        // 
    } catch (error) {
        res.status(500).json(new ApiError(500,`State - Logout\nServer side error: ${error}`));
    }
})


export {
    loginUser, logoutUser, registerUser
};


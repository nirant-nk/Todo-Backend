import jwt from 'jsonwebtoken';
import { OPTIONS } from '../constants.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';

const registerUser = asyncHandler(async (req,res) =>{
    try {
        const { fullname , username , email , password } = req.body ;    
    
        if(
            [fullname,username,email,password]
            .some(
                (field) => field?.trim() === ""
            )
        ){
            throw new ApiError(
                400,
                "All credentials are required!"
            )
        }
        
        const avatarLocalPath = req.files?.avatar[0].path ;
        if(!avatarLocalPath){
            throw new ApiError(
                400,
                "Avatar image is required!"
            )
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);

        const coverImageLocalPath = req.files?.coverImage[0].path ;
        
        let coverImage
        if(coverImageLocalPath){
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        }

        const userExist = await User.findOne({
            $or: [{email},{username}]
        })
    
        if(userExist) throw new ApiError(
            409,
            "User already Exist!"
        );
    
        const user = await User.create({
            fullname,
            email,
            avatar,
            coverImage: coverImage || "",
            username,
            password
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createdUser) throw new ApiError(
            500,
            "Something went wrong while Registering user!"
        );
    
        await user.save();
    
        res
        .status(200)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "User Created!"
            )
        );

    } catch (error) {

        res
        .status(500)
        .json(
            new ApiError(
                500,
                `State - Regisration\nServer side error: ${error}`
            )
        );
    }
})

const loginUser = asyncHandler( async (req,res) => {
    try {
        // Input - take email/username and password from req.body
        
        // let isLoggedOut 
        // if((await req.cookies?.isLoggedIn) === true){
        //     isLoggedOut = false
        // }
        // else{
        //     isLoggedOut = true
        // }

        // console.log(isLoggedOut)
        // if(!isLoggedOut) throw new ApiError(400,"User is alread logged in. Logout first!")



        const {email,username,password} = req.body;

        // Validation - check if any of them is empty !- throw ApiError
        if( !( (email && username) || password) ){
            throw new ApiError(
                400,
                `Either email or username is required! Password is always required!`
            )
        }
    
        // Search in Database - email / username !- throw ApiError
        const user = await User.findOne({
            $or: [
                {email},
                {username}
            ]
        })

        if(!user){
            throw new ApiError(
                404,
                "User not found!"
            );
        }

        // Verify password using created method in UserSchema !- throw ApiError
        const isPasswordCorrect = await user.verifyPassword(password)

        if(!isPasswordCorrect){
            throw new ApiError(
                404,
                "Incorrect Password!"
            )
        }

        // Generate JWT Tokens

        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        }) 

        // Remove password and refreshToken from user and send response
        const loggedInUser = await User.findById(user._id)
        .select(
            "-password -refreshToken"
        )

        // Set browser cookies - modifiable only from server not frontend

        res
        .status(200)
        .cookie("accessToken",accessToken,OPTIONS)
        .cookie("refreshToken",refreshToken,OPTIONS)
        // .cookie("isLoggedIn",true,OPTIONS)
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
        res
        .status(500)
        .json(new ApiError(500,`State - Login\nServer side error: ${error}`));
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
        // .cookie("isLoggedIn",false,OPTIONS)
        .json(
            new ApiResponse(
                201,
                {},
                "User Logged Out!"
            )
        )

        // 
    } catch (error) {
        res
        .status(500)
        .json(
            new ApiError(
                500,
                `State - Logout\nServer side error: ${error}`
            )
        );
    }
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(
                401,
                "Unathorized Access!"
            )
        }
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        console.log(decodedToken , user.refreshToken) // bug here
        if(decodedToken != user.refreshToken){
            throw new ApiError(
                401,
                "Unauthorized access! Invalid Refresh Token."
            )
        } 

        const accessToken = await user.generateAccessToken()

        if(!accessToken) throw new ApiError(
            501,
            "Could not generate access token!"
        )

        res
        .status(200)
        .cookie("accessToken",accessToken,OPTIONS)
        .json(
            new ApiResponse(
                201,
                user,
                "Access Token Refreshed Successfully!"
            )
        )



    } catch (error) {
        res
        .status(400)
        .json(
            new ApiError(
                500,
                `State - Refresh Access Token\nClient side error: ${error}`
            )
        );
    }
})

const deleteUser = asyncHandler(async (req,res) => {
    try {
        // authorize logged in user using jwt as middleware
        const user = await User.findByIdAndDelete(
            req.user._id,
        )
        .select(
            "-password -refreshToken"
        )

        // clear cookies
        return res
        .status(200)
        .clearCookie("accessToken",OPTIONS)
        .clearCookie("refreshToken",OPTIONS)
        .json(
            new ApiResponse(
                201,
                {
                    deletedUser: user
                },
                "User Deleted Successfully!"
            )
        )

        // 
    } catch (error) {
        res
        .status(500)
        .json(
            new ApiError(
                500,
                `State - DeleteUser\nServer side error: ${error}`
            )
        );
    }
})

export {
    deleteUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser
};


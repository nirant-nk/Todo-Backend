import jwt from 'jsonwebtoken';
import { OPTIONS } from '../constants.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';
import { sendOTP, verifyOTP } from '../utils/OtpService.js';


  // Register User and Send OTP
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;    
        
            if(
                [fullname, username, email, password].some(
                    (field) => {
                        field?.trim() === ""
                    }
                )
            ){
                throw new ApiError(
                    400,
                    "All credentials are required!"
                )
            }
        
            const userExist = await User.findOne({ $or: [{ email }, { username }] });
            if (userExist) {
                if(userExist.isVerified){
                    throw new ApiError(
                        400,
                        "User is Already Registered"
                     );
                }
                throw new ApiError(
                    409, 
                    'User already exists!'
                );
            }
            
            
            const avatarLocalPath = req.files?.avatar[0]?.path;
            if (!avatarLocalPath) {
            throw new ApiError(
                400, 
                'Avatar image is required!'
                );
            }
            const avatar = await uploadOnCloudinary(avatarLocalPath);
        
            
            let coverImage = '';
            const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
            if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
            }
        
        
            const user = await User.create({ 
                fullname, 
                username, 
                email, 
                password, 
                avatar, 
                coverImage: coverImage || ""
            })
        
            if(!user){
                throw new ApiError(
                    400,
                    "User creation failed!"
                )
            }
        
            await user.save()
            
            const otpMessage = await sendOTP(user);

            res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    null, 
                    otpMessage
                ));
    } 
    catch (error) {
        res
        .status(500)
        .json(new ApiError(400,`State - Registration\nError: ${error}`));
    }
});
  
  // Verify OTP and Complete Registration
const verifyOTPAndRegister = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;
      
        const user = await User.findOne({ email });
      
        if (!user) {
          throw new ApiError(404, "User not found!");
        }
       
        const isOTPverified = verifyOTP(user.otp, otp);
      
        // console.log("here",registrationSuccess)
        if(user.isVerified){

            await user.updateOne(
                {
                    $unset: {
                        otp: 1,
                    }
                },
                {
                    new: true
                }
            )

            throw new ApiError(
                400,
                "User is Already Registered"
             )
        
        }else if ( !isOTPverified ) {
          // OTP is incorrect, delete the user from the database
          // Or after 1 minute the user data will be automatically deleted
          throw new ApiError(401, 'Invalid or expired OTP!');
        }
        
        // Remove sensitive data (like password) from the response
        const createdUser = await User.findByIdAndUpdate(
            user._id,
            {
                $unset: {
                    otp: 1,
                    otpExpiry: 1
                },
                $set:{
                    isVerified: true
                }
            },
            {
                new: true
            }
        )
        .select('-password -refreshToken');
        
        if (!createdUser) {
          throw new ApiError(400, 'User creation failed!');
        }
      
        res.status(201).json(new ApiResponse(201, createdUser, 'User registered successfully!'));
    } catch (error) {
        res
        .status(500)
        .json(new ApiError(400,`State - OTP Verification - Client side error: ${error}`));
    }
});
  

const loginUser = asyncHandler(async (req,res) => {

    try {

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

        if(!user.isVerified){
            throw new ApiError(
                400,
                "Please register and verify your account before login."
            )
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
        const otpMessage = await sendOTP(user);

        res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                null, 
                otpMessage
        ));

       
    } catch (error) {
        res
        .status(400)
        .json(new ApiError(400,`State - Login\nClient side error: ${error}`));
    }
})

const verifyOTPAndLogin = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;
      
        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(404, "User not found!");
        }

        
        if(!user.isVerified){
            throw new ApiError(
                400,
                "Please register and verify your account before login."
            )
        }
        // console.log(` user at verification : ${user}`);

        // console.log(`Entered otp: ${otp}`)
      
        const isOTPverified = verifyOTP(user.otp, otp);
      
        // console.log("here",registrationSuccess)
        
        if (!isOTPverified) {
          // OTP is incorrect, delete the user from the database
          // Or after 1 minute the user data will be automatically deleted
          throw new ApiError(401, 'Login Failed. Invalid or expired OTP!');
        }
        
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        }) 

        // Remove password and refreshToken from user and send response
        const loggedInUser = await User.findByIdAndUpdate(
            user._id,
            {
                $unset: {
                    otp:1
                }
            },
            {
                new : true
            }
         )
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
        .status(400)
        .json(new ApiError(400,`State - Login OTP Verification - Client side error: ${error}`));
    }
});

const resendOTP = asyncHandler(async (req,res) => {
    try {
        const {email} = req.body 
        const user = await User.findOne({
            email
        })

        const otpMessage = await sendOTP(user)

        res
        .status(200)
        .json(
            new ApiResponse(
                201,
                null,
                otpMessage
            )
        )

    } catch (error) {
        res
        .status(500)
        .json(
            new ApiError(
                500,
                `State - resend OTP | ERROR : ${error}`
            )
        )
    }
} ) 

const logoutUser = asyncHandler(async (req,res) => {
    try {
        // authorize logged in user using jwt as middleware
        await req.user.updateOne(
            {
                $unset: {
                    refreshToken: 1
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

        // console.log(decodedToken , user.refreshToken) // bug here
// const isValid = incomingRefreshToken === user.refreshToken;
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

const updateDetails = asyncHandler(async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;
        const user = req.user; // From the JWT authorization middleware

        if (!fullname && !username && !email && !password && !req.files?.avatar && !req.files?.coverImage) {
            throw new ApiError(400, 'At least one field is required for update');
        }

        // Validate if email or username is being updated, and check if they already exist
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new ApiError(409, 'Email is already taken!');
            }
        }

        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                throw new ApiError(409, 'Username is already taken!');
            }
        }

        // Handle password update if provided
        if (password) {
        
            user.password = password;
        }

        // Handle avatar update if provided
        let avatar = user.avatar;
        if (req.files?.avatar) {
            const avatarLocalPath = req.files.avatar[0].path;
            avatar = await uploadOnCloudinary(avatarLocalPath);
        }

        // Handle cover image update if provided
        let coverImage = user.coverImage;
        if (req.files?.coverImage) {
            const coverImageLocalPath = req.files.coverImage[0].path;
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        }

        // Update the user details in the database
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: { fullname, username, email, avatar, coverImage },
            },
            { new: true }
        ).select('-password -refreshToken');

        res.status(200).json(new ApiResponse(200, updatedUser, 'User details updated successfully'));
    } catch (error) {
        res.status(500).json(new ApiError(500, `Update details error: ${error.message}`));
    }
});

const deleteUser = asyncHandler(async (req,res) => {
    try {
        // authorize logged in user using jwt as middleware
        const user = await User.findByIdAndDelete(
            req.user._id,
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
    registerUser,
    resendOTP,
    updateDetails,
    verifyOTPAndLogin,
    verifyOTPAndRegister
};


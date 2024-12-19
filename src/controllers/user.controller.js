import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req,res) =>{
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
})

export { registerUser };

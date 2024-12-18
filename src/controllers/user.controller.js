import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req,res) =>{
    const {fullname,email,password} = req.body;
    const userExist = await User.findOne({email})

    if(userExist){
        return res.status(400).send(new ApiError(401,message="Email already exist!"))
    }
    if(!( password && email)){
        return res.status(400).send(new ApiError(401,message="Credentials are required!"))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        fullname,
        email,
        password: hashedPassword, 
    });
    

    await user.save();

    res.status(200).send(new ApiResponse(201,data=user,"User Created Successfully"))

})
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authorizeAccess = asyncHandler(async (req,res,next) => {
    try {
        const token = await 
        req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")

        if(!token) throw new ApiError(404,"No token found, Unauthorized Access.")

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        // console.log(user.email, decodedToken.email) //check while fixing bug
        if(user._id != decodedToken._id) throw new ApiError(401,"Authorization Revoked!")

        if(!user) throw new ApiError(400,"Invalid Token! No such user!")

        req.user = user
        next()
    } catch (error) {
        
        res
        .status(400)
        .json(
            new ApiError(400,`State - Authorization\nServer side error: ${error}`)
        );
    }
})

export default authorizeAccess
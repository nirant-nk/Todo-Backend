import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

const getUserIdFromToken = asyncHandler(
    async (req,res,next) => {
        try {
            const token = req.cookies?.accessToken || req.body.accessToken;
        
            if (!token) {
                throw new ApiError(401, 'Access token missing');
            }
        
            const decodedAccessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
            if(!decodedAccessToken){
                throw new ApiError(
                    404,
                    "Invalid Access Token!"
                ) 
            }
        
            if(!decodedAccessToken._id) throw new ApiError(
                404,
                "No user found from the access token!"
            )
    
            req.userID = decodedAccessToken._id;
            next()
        } catch (error) {
            res
            .status(400)
            .json(
                new ApiError(
                    400,
                    `State - get Use id - ERROR ${error}`
                )
            )
        }
    }
);

export default getUserIdFromToken
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) throw new ApiError(
            400,
            "No file available for upload!"
        )

        const result = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        )

        if(!result) throw new ApiError(
            500,
            "Error While Uploading the file"
        )

        fs.unlinkSync(localFilePath)

        return result.url
    } catch (error) {
        try {
            fs.unlinkSync(localFilePath)
        } catch (error) {
           
        }
        
        throw new ApiError(
            400,
            `State - Cloudinary Upload! ERROR - ${error}`
        )
    }
}

export default uploadOnCloudinary;
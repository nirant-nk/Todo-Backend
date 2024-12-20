import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const connectDB = asyncHandler(async () => {
        try {
            const connection = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
            console.log(
                `\nMongoDB connection successfull!\nDB host: ${connection.connection.host}`
            );
        } catch (error) {
            console.log(
                "MongoDB connection ERROR : DB connection failed! Description - ",
                error
            );
            process.exit(1);
        }
    }
)

export {
    connectDB
};


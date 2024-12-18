import mongoose, { Schema } from "mongoose";

// Define the Fullname schema as a subdocument


// User schema embedding fullname directly
const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    }
});

const User = mongoose.model("User", UserSchema);

export { User };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    avatar:{
        type: String,
        required: true
    },
    coverImage:{
        type:String
    },
    refreshToken:{
        type: String
    },
    otp:{
        type: String
    },
    otpExpiry:{
        type: Date,
        index: {
            expireAfterSeconds: 180
        }
    },
    isVerified:{
        type: Boolean,
        required: true,
        default: false
    },
    password:{
        type:String,
        required:true
    }
});

UserSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

UserSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(
        password,
        this.password
    ); 
}


UserSchema.methods.generateAccessToken = function(){
    const payload = {
        _id: this._id,
        fullname : this.fullname,
        email : this.email,
        username : this.username
    }

    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    const payload = {
        _id: this._id
    }

    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


const User = mongoose.model("User", UserSchema);

export { User };


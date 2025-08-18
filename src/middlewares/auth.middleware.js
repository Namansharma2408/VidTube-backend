import { User } from "../models/user.model.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler(async(req,res,next) =>{
    try{
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401, "Password is required")
        }

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodeURI?._id).select("-password -refreshtoken")

        if(!user){
            // TODO: will discuss later
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user
        next()
    }catch(error){
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
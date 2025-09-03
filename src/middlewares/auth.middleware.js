import { User } from "../models/user.model.js"
import { ApiError, asyncHandler } from "../utils/index.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async (req,res,next) =>{
    try{

        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        console.log(req.cookies)
        console.log("Token received:", token)
        console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET ? "EXISTS" : "NOT FOUND")

        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded token:", decodedToken)

        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")

        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user
        next()
    }catch(error){
        console.log("Auth middleware error:", error.message)
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
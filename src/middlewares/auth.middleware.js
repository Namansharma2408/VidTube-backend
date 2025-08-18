import { asyncHandler } from "../utils/index.js";


export const verifyJWT = asyncHandler(async(req,res,next) =>{
    req.cookies?.accesstoken || req.header("Authorization")
})
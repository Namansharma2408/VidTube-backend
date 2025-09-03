import { asyncHandler,ApiError,ApiResponse } from "../utils/index.js";
import {User} from "../models/index.js"
import {uploadOnCloudinary} from "../utils/index.js"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async (userId) => {
    try{
        console.log("Generating tokens for userId:", userId)
        const user = await User.findById(userId)
        console.log("User in 2nd step of generateAccessAndRefreshToken")
        if(!user){
            throw new ApiError(404,"User not found")
        }
        console.log("User in 3rd step of generateAccessAndRefreshToken")
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()
        console.log("Generated tokens", {accesstoken, refreshtoken})
        user.refreshtoken = refreshtoken
        await user.save({validateBeforeSave:false})

        return {accesstoken,refreshtoken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    // get user detail from frontend 
    // validation - not empty 
    // check if user already exist: username , email
    // check for images, check for avatar
    // upload them on cloudinary, avatar
    // create user object - create entry in db
    // remove passowrd and refresh token in field
    // check for user creation
    // return res

    const {fullname,username,email,password} = req.body;
    if(
        [fullname,username,email,password].some((field) => !field || field.trim() === "")
    ){
        throw new ApiError(400,"All fields are required required");
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if( existedUser ) {
        throw new ApiError(409,"User with username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverimage[0]?.path
    let coverImageLocalPath;
    if( req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0 ){
        coverImageLocalPath = req.files.coverimage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


    
})


const loginUser = asyncHandler(async (req,res) => {
    // user se input
    // username or email
    // find the user if he is there or not
    // password check
    // give him access token and store its data in data base
    // also store refresh token into database
    // send cookie

    const {email,username,password} = req.body
    if(!username || !email){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accesstoken,refreshtoken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accesstoken,refreshtoken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    } 
    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
   const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken
   if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401,"Invalid refresh token")
    }
 
    if(incomingRefreshToken !== user?.refreshtoken){
     throw new ApiError(401,"Refresh token is expired or used")
    }
 
    const options = {
     httpOnly:true,
     secure:true,
    }
 
    const {newaccesstoken,newrefreshtoken} = await generateAccessAndRefreshToken(user._id)
 
    return res
    .status(200)
    .cookie("accesstoken",newaccesstoken,options)
    .cookie("refreshtoken",newrefreshtoken,options)
    .json(
     new ApiResponse(
         200,
         {accesstoken:newaccesstoken,refreshtoken:newrefreshtoken},
         "Access token refreshed"
     )
    )
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
   }
})


export {registerUser,loginUser,logoutUser,refreshAccessToken}
import { asyncHandler,ApiError,ApiResponse } from "../utils/index.js";
import {User} from "../models/index.js"
import {uploadOnCloudinary} from "../utils/index.js"
import cookieParser from "cookie-parser";

const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

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
        [fullname,username,email,password].some((field) => field.trim() === "")
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
    User.findByIdAndUpdate(
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
    .clearCookie("refreshtoken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

export {registerUser,loginUser,logoutUser}
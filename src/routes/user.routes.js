import { Router } from "express";
import { registerUser,loginUser,logoutUser } from "../conrollers/index.js";
import {upload} from "../middlewares/index.js"
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:1
        },
        {
            name:"coverimage",
            maxcount:1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

export default router
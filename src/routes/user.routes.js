import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken } from "../conrollers/index.js";
import {upload} from "../middlewares/index.js"
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
router.route("/refresh-token").post(refreshAccessToken)

export default router
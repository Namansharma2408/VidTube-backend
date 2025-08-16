import { Router } from "express";
import { registerUser } from "../conrollers/index.js";
import {upload} from "../middlewares/index.js"
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


export default router
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../conrollers/index.js";
import { upload } from "../middlewares/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../conrollers/user.controller.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxcount: 1,
    },
    {
      name: "coverimage",
      maxcount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage);
router.route("/C/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;

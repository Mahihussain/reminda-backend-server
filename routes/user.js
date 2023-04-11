import express from "express";
import { changePassword, forgotPassword, getMyProfile, login, logout, resetPassword, signup, updatePic, updateProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login);

router.post("/signup", singleUpload, signup);

router.get("/me", isAuthenticated, getMyProfile);


router.get("/logout", isAuthenticated, logout);

router.put("/updateProfile", isAuthenticated, updateProfile);

router.put("/changePassword", isAuthenticated, changePassword);

router.route("/forgotPassword").post(forgotPassword).put(resetPassword);

router.put("/updatePic", isAuthenticated, singleUpload, updatePic);




export default router;
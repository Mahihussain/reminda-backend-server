import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import cloudinary from "cloudinary";
import { asyncError } from "../middlewares/error.js";
import { sendToken, cookieOptions, sendEmail, getDataUri } from "../utils/features.js";

export const login = asyncError(async (req, res, next) => {
    const {email, password} = req.body;
    console.log("Reached")
    const user = await User.findOne({email}).select("+password");
    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password!!", 400));
    }

    if(!password) 
    {
        return next(new ErrorHandler("Please Enter Password", 400));
    }
    const isMatched = await user.comparePassword(password);
    if(!isMatched)
    {
        return next(new ErrorHandler("Invalid Email or Password!!", 400));
    } 
    
    sendToken(user, res, `Welcome Back, ${user.username}`, 200);

    
});

export const signup = asyncError(async (req, res, next) => {
    
    const {username, email, password, dob} = req.body;
    //console.log({username, email, password, dob});
    let user = await User.findOne({email});
    if(user)
    {
        return next(new ErrorHandler("User Already Exists", 400));
    }
    let avatar = undefined;
    if(req.file)
    {
        const file = getDataUri(req.file);
        const myCloud = await cloudinary.v2.uploader.upload(file.content);
        avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        };
    }

    user = await User.create({
        username, email, password, avatar, dob
    });
    sendToken(user, res, "Registered Successfully !!", 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true, user
    });

});

export const updateProfile = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const { username, dob, friend_list, interests } = req.body;
    if(username) user.username = username;
    if(dob) user.dob = dob;
    if(friend_list) user.friend_list = friend_list;
    if(interests) user.interests = interests;
    await user.save();
    res.status(200).json({
        success: true, message: "Profile Updated Successfully !!"
    });

});

export const changePassword = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id).select("+password");
    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword) 
    {
        return next(new ErrorHandler("Incorrect Old Password and New Password", 400));
    }

    const isMatched = await user.comparePassword(oldPassword);
    if(!isMatched)
    {
        return next(new ErrorHandler("Incorrect Old Password", 400));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true, message: "Passwrod Changed Successfully !!"
    });

});

export const logout = asyncError(async (req, res, next) => {


    res.status(200).cookie("token", "", {
        //...cookieOptions,
        expires: new Date(Date.now())       
    }).json({
        success: true, 
        message: "Logout Successfully !"
    });

});
export const forgotPassword = asyncError(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({email});
    if(!user)
    {
        return next(new ErrorHandler("Incorrect Email", 404));
    }
    const randomNumber = Math.random() * (999999 - 100000) + 100000;
    const otp = Math.floor(randomNumber);
    const otp_expire = 15 * 60 * 1000;

    user.otp = otp;
    user.otp_expire = new Date(Date.now() + otp_expire);

    await user.save();
    console.log(otp);
    const message = `Your OTP for resetting password is ${otp}.\n Please Ignore if you haven't requested this.`;
    try {
        await sendEmail("OTP for resetting Password", user.email, message);    
    } catch (error) {
        user.otp = null;
        user.otp_expire = null;
        await user.save();
        return next(error);
    }
    res.status(200).json({
        success: true, 
        message: `Email Sent to ${user.email}`
    });

});

export const resetPassword = asyncError(async (req, res, next) => {

    const { otp, password } = req.body;
    const user = await User.findOne({
        otp,
        otp_expire: {
            $gt: Date.now()
        }
    });

    if(!user || !otp)
    {
        return next(new ErrorHandler("Incorrect OTP or Has been Expired", 400));
    }
    if(!password)
    {
        return next(new ErrorHandler("Please Enter New Password", 400));
    }
    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;
    await user.save();

    res.status(200).json({
        success: true, message: "Password Changed Successfully !!"
    });

});

export const updatePic = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id)

    const file = getDataUri(req.file);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    user.avatar = {
         public_id: myCloud.public_id,
         url: myCloud.secure_url
    };
    await user.save();
    res.status(200).json({
        success: true, 
        message: "Avatar Updated Successfully !"
    });

});
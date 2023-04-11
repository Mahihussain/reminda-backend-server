import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const schema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, "Please a Enter a Username"]
    },
    email: {
        type: String,
        required: [true, "Please a Enter an Email"],
        unique: [true, "Email Already Exists"],
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, "Please a Enter a Password"],
        minLength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    otp: Number,
    otp_expire: Date,
    dob: {type: String, required: [true, "Please a Enter a Date of Birth"]},
    friend_list: [{
        type: String
    }],
    interests: [{
        type: String
    }]
});

schema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); 
    this.password = await bcrypt.hash(this.password, 10);
});

schema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

schema.methods.generateToken =  function(enteredPassword){
    return jwt.sign({_id: this._id}, process.env.JWT_SECRET, {
        
        expiresIn: "15d"

    }); 
}
export const User = mongoose.model("User", schema);


import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";

connectDB();

const port = process.env.PORT || 8000;

cloudinary.v2.config({

    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

});

app.listen(port, () => {
    console.log(`Server Listening on port: ${port}`);
})
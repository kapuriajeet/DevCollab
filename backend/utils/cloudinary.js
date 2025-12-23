import fs from 'fs';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (filePath, folder) => {

  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: folder

    });

    console.log("file is uploaded on cloudinary", response.secure_url);
    return response;
  } catch (err) {
    fs.unlinkSync(filePath);
    console.log("Error while uploading cloudinary");
    return null;
  }
};

export { uploadOnCloudinary };

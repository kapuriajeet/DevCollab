import fs, { existsSync } from 'fs';
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
      folder: folder,
      transformation: [
        { width: 1080, height: 1080, crop: "limit" },
        { fetch_format: "auto", quality: "auto" },
      ],
    });

    fs.unlinkSync(filePath);
    return response;
  } catch (err) {
    if (existsSync(filePath))
      fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadOnCloudinary };

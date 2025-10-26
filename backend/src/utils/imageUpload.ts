import { v2 as cloudinary } from "cloudinary";
import fs, { unlinkSync } from "fs";
import ApiError from "./apiError";

// Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath: string) => {
  try {
    if (!localPath) return null;
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    // console.log(
    //   "file uploaded successfully",
    //   response.url,
    //   response.public_id,
    //   response.asset_id
    // );
    fs.unlinkSync(localPath); // remove local file
    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    // console.log("error occured while uploading ", error);
    return null;
  }
};


const removeFromCloudinary = async (avatar_url: string) => {
  try {
    // Extract public_id from URL
    const parts = avatar_url.split("/");
    const filename = parts[parts.length - 1]; // Get last element
    const public_id = filename.replace(/\..*$/, ""); // Remove file extension
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === "ok") {
      // console.log("Old avatar deleted successfully:", public_id);
      return result;
    } else {
      // console.log("Failed to delete avatar:", result);
      return null;
    }
  } catch (error: any) {
    // console.error("Error deleting from Cloudinary:", error);
    throw new ApiError(
      400,
      error?.message || "Unable to delete previous avatar"
    );
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
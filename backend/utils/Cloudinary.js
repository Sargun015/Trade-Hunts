// import { v2 as cloudinary } from 'cloudinary';

// const connectCloudinary = async () => {

//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_SECRET_KEY
//     });

// }



// export default connectCloudinary;


import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
export const uploadImage = async (file, folder = 'portfolio') => {
  try {
    // Convert base64 to buffer if needed
    let fileToUpload = file;
    if (file.startsWith('data:')) {
      fileToUpload = file;
    }
    
    const result = await cloudinary.v2.uploader.upload(fileToUpload, {
      folder: `freelan/${folder}`,
      resource_type: 'auto'
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
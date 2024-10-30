const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (filePath, folder, public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(filePath, { folder, public_id, width: 500, crop: "scale" })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = uploadToCloudinary;

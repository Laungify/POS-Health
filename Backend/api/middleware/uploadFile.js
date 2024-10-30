const util = require("util");
const multer = require("multer");
const path = require("path");
const maxSize = 10 * 1024 * 1024;

// const imageFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb("Image is not of type jpg/jpeg or png", false);
//   }
// };

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.parse(file.originalname).ext}`);
  },
});

let uploadImage = multer({
  storage: storage,
  //fileFilter: imageFilter,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadImage);
module.exports = uploadFileMiddleware;

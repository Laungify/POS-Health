const uploadFile = require("../api/middleware/uploadPrescription");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");

exports.create = async (req, res, next) => {

  try {
    await uploadFile(req, res);

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "Please upload a file",
      });
    }

    const cloudinaryImage = await uploadToCloudinary(
      req.file.path,
      "prescriptions"
    );

    res.status(200).json(cloudinaryImage);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error uploading file",
    });
  }
};

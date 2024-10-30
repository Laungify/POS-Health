const Registration = require("../models/registration");

exports.create = async (req, res, next) => {
  try {
    const { name, email, type } = req.body;

    if (!name || !email || !type) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }
    if (name.length < 3) {
      return res.status(400).json({
        code: 400,
        message: "Name has to be more than two characters",
      });
    }

    const registration = new Registration({
      name,
      email,
      type,
    });

    await registration.save();

    return res.status(201).json(registration);
  } catch (error) {
    console.log(
      "🚀 ~ file: registration.js ~ line 55 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Server error",
    });
  }
};

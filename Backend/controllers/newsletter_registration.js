const NewsletterRegistration = require("../models/newsletter_registration");

exports.register = async (req, res, next) => {
  try {
    const { email, promotions } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Email is required",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }

    const emailFound = await NewsletterRegistration.findOne({ email: email });
    if (emailFound) {
      return res.status(200).json({
        message: "Newsletter registration successful",
      });
    }

    const registration = new NewsletterRegistration({
      email,
      promotions,
    });

    await registration.save();

    return res.status(200).json({
      message: "Newsletter registration successful",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 286 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error registering for newsletter!",
    });
  }
};

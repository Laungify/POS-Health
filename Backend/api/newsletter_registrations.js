const express = require("express");
const router = express.Router();
const NewsLetterRegistrationController = require("../controllers/newsletter_registration");

router.post("/register", NewsLetterRegistrationController.register);

module.exports = router;

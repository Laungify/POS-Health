const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/search");

router.post("/", SearchController.create);

module.exports = router;

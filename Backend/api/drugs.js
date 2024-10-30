const express = require("express");
const router = express.Router();
const DrugController = require("../controllers/drug");

router.get("/", DrugController.getAll);

module.exports = router;

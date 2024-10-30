const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product");

router.post("/", ProductController.create);

router.patch("/:productId", ProductController.update);

router.get("/:productId", ProductController.getById);

router.get("/", ProductController.getAll);

router.delete("/:productId", ProductController.delete);

module.exports = router;

const express = require("express");
const router = express.Router();
const SupplierController = require("../controllers/supplier");

router.post("/", SupplierController.create);

router.patch("/:supplierId", SupplierController.update);

router.delete("/:supplierId", SupplierController.delete);

module.exports = router;

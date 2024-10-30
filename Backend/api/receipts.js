const express = require("express");
const router = express.Router();
const ReceiptController = require("../controllers/receipt");

router.post("/", ReceiptController.create);

router.patch("/:receiptId", ReceiptController.update);

router.delete("/:receiptId", ReceiptController.delete);

module.exports = router;

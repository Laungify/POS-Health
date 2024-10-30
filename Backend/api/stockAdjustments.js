const express = require("express");
const router = express.Router();
const StockAdjustmentController = require("../controllers/stockAdjustment");

router.post("/", StockAdjustmentController.create);

router.patch("/:stockAdjustmentId", StockAdjustmentController.update);

router.delete("/:stockAdjustmentId", StockAdjustmentController.delete);

module.exports = router;

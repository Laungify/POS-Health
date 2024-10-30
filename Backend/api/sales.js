const express = require("express");
const router = express.Router();
const SaleController = require("../controllers/sale");

router.post("/", SaleController.create);
router.post("/bulkSale", SaleController.bulkSaleCreate);
router.patch("/:saleId", SaleController.update);
router.patch("/:saleId/bill", SaleController.bill);
router.patch("/:saleId/cancel", SaleController.cancel);
router.delete("/:saleId", SaleController.delete);
router.get("/:saleId", SaleController.getById);

module.exports = router;

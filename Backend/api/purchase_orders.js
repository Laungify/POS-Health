const express = require("express");
const router = express.Router();
const PurchaseOrderController = require("../controllers/purchase_order");

router.post("/", PurchaseOrderController.create);

router.patch("/:purchaseOrderId", PurchaseOrderController.update);

router.delete("/:purchaseOrderId", PurchaseOrderController.delete);

/* router.patch("/:purchaseOrderId", PurchaseOrderController.update);

router.get("/:purchaseOrderId", PurchaseOrderController.getById);

router.delete("/:purchaseOrderId", PurchaseOrderController.delete); */

module.exports = router;

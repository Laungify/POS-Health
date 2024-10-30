const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order");

router.post("/", OrderController.create);


router.get("/:orderId", OrderController.getById);

router.delete("/:orderId", OrderController.delete);

router.patch("/:orderId/process", OrderController.processOrder);

router.patch("/:orderId/processcancel", OrderController.processOrderCancel);

router.patch("/:orderId/processreceived", OrderController.processOrderReceived);

router.patch("/:orderId/processconfirm", OrderController.processOrderConfirm);

module.exports = router;

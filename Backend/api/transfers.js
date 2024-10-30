const express = require("express");
const router = express.Router();
const TransferController = require("../controllers/transfer");

router.post("/", TransferController.create);

router.delete("/:transferId", TransferController.undo);

module.exports = router;

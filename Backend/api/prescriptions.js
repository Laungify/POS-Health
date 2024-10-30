const express = require("express");
const router = express.Router();
const PrescriptionController = require("../controllers/prescription");

router.post("/", PrescriptionController.create);
router.post("/sendSms", PrescriptionController.sendSms);


router.get("/:prescriptionId", PrescriptionController.getById);

router.patch("/:prescriptionId", PrescriptionController.update);

router.delete("/:prescriptionId", PrescriptionController.delete);

router.patch("/:prescriptionId/process", PrescriptionController.processOrder);

router.patch("/:prescriptionId/processcancel", PrescriptionController.processOrderCancel);

router.patch("/:prescriptionId/processreceived", PrescriptionController.processOrderReceived);

router.patch("/:prescriptionId/processconfirm", PrescriptionController.processOrderConfirm);

module.exports = router;

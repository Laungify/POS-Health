const express = require("express");
const router = express.Router();
const ShopController = require("../controllers/shop");

router.post("/", ShopController.create);

router.get("/", ShopController.getAll);

router.patch("/:shopId", ShopController.update);

router.get("/:shopId", ShopController.getById);

router.delete("/:shopId", ShopController.delete);

router.get("/:shopId/orders", ShopController.getShopOrders);

router.get(
  "/:shopId/patients/:patientId/orders",
  ShopController.getShopPatientOrders
);

router.get("/:shopId/sales", ShopController.getShopSales);

router.get("/:shopId/getShopInfos", ShopController.getShopInfos);
router.get("/:shopId/products", (req, res, next) => {
  if (req.query.genericName) {
    return ShopController.getShopInfoByGenericName(req, res, next);
  }
  return ShopController.getShopProducts(req, res, next);
});

router.get("/:shopId/products/:productId", ShopController.getShopProduct);


router.get("/:shopId/staff", ShopController.getShopStaff);

router.get("/:shopId/purchase_orders", ShopController.getShopPurchaseOrders);

router.get("/:shopId/receipts", ShopController.getShopReceipts);

router.get("/:shopId/expenses", ShopController.getShopExpenses);

router.get("/:shopId/suppliers", ShopController.getShopSuppliers);

router.get("/:shopId/stockAdjustments", ShopController.getShopStockAdjustments);

router.get("/:shopId/transfers", ShopController.getShopTransfers);

router.get("/:shopId/patients", ShopController.getShopPatients);

router.get("/:shopId/appointments", ShopController.getShopAppointments);

router.post("/:shopId/patients", ShopController.createShopPatient);

router.patch("/:shopId/patients/:patientId", ShopController.updateShopPatient);

router.delete("/:shopId/patients/:patientId", ShopController.deleteShopPatient);

router.get(
  "/:shopId/patients/:invite/invite",
  ShopController.getShopInvitedPatient
);

router.get("/:shopId/prescriptions", ShopController.getShopPrescriptions);

router.post(
  "/:shopId/patients/:patientId/prescriptions",
  ShopController.createShopPatientPrescription
);

router.patch(
  "/:shopId/patients/:patientId/prescriptions/:prescriptionId",
  ShopController.updateShopPatientPrescription
);

router.delete(
  "/:shopId/patients/:patientId/prescriptions/:prescriptionId",
  ShopController.deleteShopPatientPrescription
);

router.get(
  "/:shopId/patients/:patientId/prescriptions",
  ShopController.getShopPatientPrescriptions
);

router.post(
  "/:shopId/patients/:patientId/medications",
  ShopController.createShopPatientMedication
);

router.patch(
  "/:shopId/patients/:patientId/medications/:medicationId",
  ShopController.updateShopPatientMedication
);

router.delete(
  "/:shopId/patients/:patientId/medications/:medicationId",
  ShopController.deleteShopPatientMedication
);

router.get(
  "/:shopId/patients/:patientId/medications",
  ShopController.getShopPatientMedications
);

router.post(
  "/:shopId/patients/:patientId/medical_history",
  ShopController.createShopPatientMedicalHistory
);

router.patch(
  "/:shopId/patients/:patientId/medical_history/:medicalHistoryId",
  ShopController.updateShopPatientMedicalHistory
);

router.get(
  "/:shopId/patients/:patientId/medical_history",
  ShopController.getShopPatientMedicalHistory
);

router.delete(
  "/:shopId/patients/:patientId/medical_history/:medicalHistoryId",
  ShopController.deleteShopPatientMedicalHistory
);

router.get(
  "/:shopId/patients/:patientId/medication_encounters",
  ShopController.getShopPatientMedicationEncounters
);


router.post(
  "/:shopId/patients/:patientId/medical_notes",
  ShopController.createShopPatientMedicalNotes
);

router.get(
  "/:shopId/patients/:patientId/medical_notes",
  ShopController.getShopPatientMedicalNotes
);


module.exports = router;

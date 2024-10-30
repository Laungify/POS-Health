const express = require("express");
const router = express.Router();
const MedicationEncounterController = require("../controllers/medication_encounter");

router.post("/", MedicationEncounterController.create);

router.patch("/:medicationEncounterId", MedicationEncounterController.update);

router.get("/:medicationEncounterId", MedicationEncounterController.getById);

router.delete("/:medicationEncounterId", MedicationEncounterController.delete);

module.exports = router;

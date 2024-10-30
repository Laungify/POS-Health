const express = require("express");
const router = express.Router();
const MedicalNotesController = require("../controllers/medication_notes");

router.post("/", MedicalNotesController.create);

router.patch("/:clinicalNoteId", MedicalNotesController.update);

router.get("/:clinicalNoteId", MedicalNotesController.getById);

router.delete("/:clinicalNoteId", MedicalNotesController.delete);

module.exports = router;

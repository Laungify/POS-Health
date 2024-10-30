const express = require("express");
const router = express.Router();
const DoctorController = require("../controllers/doctor");

router.get("/", DoctorController.getAll);
router.get("/:doctorId", DoctorController.getById);
router.get("/:doctorId/appointments", DoctorController.getDoctorAppointments);
module.exports = router;

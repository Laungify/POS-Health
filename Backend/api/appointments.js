const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointment");

// create an appointment
router.post("/", AppointmentController.create);

// get an appointment
router.get("/:appointmentId", AppointmentController.getById);

// delete an appointment
router.delete("/:appointmentId", AppointmentController.delete);

// Update an appointment
router.put("/:appointmentId", AppointmentController.update);

// Cancel an appointment
router.patch("/:appointmentId/cancel", AppointmentController.cancel);

module.exports = router;

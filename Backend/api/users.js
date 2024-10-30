const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const passport = require("passport");
require("../passport_google");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/", UserController.getAll);
router.get("/:userId", UserController.getById);
router.patch("/:userId", UserController.update);
router.patch("/:userId/phoneNumber", UserController.updatePhoneNumber);

router.post("/request-password-reset", UserController.requestPasswordReset);
router.post("/reset-password", UserController.resetPassword);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  UserController.redirectToClient
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  UserController.googleLogin
);

router.get("/verify-login-token/:token", UserController.verifyLoginToken);

router.get("/verify-email/:token", UserController.verifyEmail);

router.get("/:userId/orders", UserController.getUserOrders);

router.get("/:userId/prescriptions", UserController.getUserPrescription);

router.get("/:userId/appointments", UserController.getUserAppointments);

router.get(
  "/:userId/medication_encounters",
  UserController.getUserMedicationEncounters
);

router.get(
  "/:userId/clinical_encounters",
  UserController.getUserClinicalEncounters
);




router.get("/:userId/vitals", UserController.getUserVitals);

router.post("/:userId/vitals", UserController.createUserVitals);

router.patch("/:userId/vitals", UserController.updateUserVitals);

router.delete("/:userId/vitals/:vitalsId", UserController.deleteUserVitals);

module.exports = router;

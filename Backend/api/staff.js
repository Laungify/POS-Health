const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/staff");

router.post("/", StaffController.create);

router.patch("/:staffId", StaffController.update);

router.get("/:staffId", StaffController.getById);

// router.delete("/:staffId", StaffController.delete);

router.post("/login", StaffController.login);

router.patch("/:token/verify_staff", StaffController.verifyEmail);

router.post("/password", StaffController.setPassword);

router.post("/reset_password", StaffController.resetPassword);

router.post("/reinvite", StaffController.reinviteStaff);

router.get("/:staffId/shops", StaffController.getStaffShops);

router.post("/request_password_reset", StaffController.requestPasswordReset);

router.delete("/:staffId/shop/:shopId", StaffController.delete);

router.post("/:staffId/availability", StaffController.addAvailability);

router.patch(
  "/:staffId/availability/:availabilityId",
  StaffController.updateAvailability
);

router.get("/:staffId/availability", StaffController.getAvailability);

router.delete(
  "/:staffId/availability/:availabilityId",
  StaffController.deleteAvailability
);

module.exports = router;

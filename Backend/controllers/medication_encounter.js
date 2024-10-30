const User = require("../models/user");
const Shop = require("../models/shop");
const MedicationEncounter = require("../models/medication_encounter");

const mongoose = require("mongoose");

exports.create = async (req, res, next) => {
  try {
    const {
      shopId,
      userId,
      reviewerId,
      medications,
      prescriptions,
      goals,
      referral,
    } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const referralValid = referral.doctor && Object.keys(referral.doctor).length > 0 ? referral : [];

    const newMedicationEncounterId = new mongoose.Types.ObjectId();

    const newMedicationEncounter = new MedicationEncounter({
      ...req.body,
      _id: newMedicationEncounterId,
      user: userId,
      shop: shopId,
      reviewer: reviewerId,
      goals,
      referral: referralValid,
    });

    await newMedicationEncounter.save();

    medications.map((item) => {
      item.medicationEncounterId = newMedicationEncounterId;
    });

    prescriptions.map((item) => {
      item.medicationEncounterId = newMedicationEncounterId;
    });

    user.medications.unshift(...medications);
    user.prescriptions.unshift(...prescriptions);

    await user.save();

    const medicationEncounter = await MedicationEncounter.findById(
      newMedicationEncounterId
    )
      .populate("user")
      .populate("shop")
      .populate("reviewer");

    return res.status(201).json(medicationEncounter);
  } catch (error) {
    console.log(
      "🚀 ~ file: medication_encounter.js:420 ~ exports.create= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating medical encounter",
    });
  }
};
exports.update = async (req, res, next) => {
  try {
    const {
      shopId,
      reviewerId,
      userId,
      medications,
      prescriptions,
      currentMedications,
      medicationUnderstanding,
      potentialDrugInteractions,
      potentialSideEffects,
      therapeuticAlternatives,
      pharmacologicalInterventions,
      nonPharmacologicalInterventions,
      followUp,
      intervention,
      recommendationToClinician,
      recommendationToPatient,
      goals,
      referral
    } = req.body;

    const medicationEncounterId = req.params.medicationEncounterId;

    const medicationEncounter = await MedicationEncounter.findById(medicationEncounterId)
      .populate("user")
      .populate("shop")
      .populate("reviewer");

    if (!medicationEncounter) {
      return res.status(404).json({ message: "Medication encounter not found" });
    }

    medicationEncounter.shop = shopId || medicationEncounter.shop;
    medicationEncounter.reviewer = reviewerId || medicationEncounter.reviewer;
    medicationEncounter.user = userId || medicationEncounter.user;
    medicationEncounter.medications = medications || medicationEncounter.medications;
    medicationEncounter.prescriptions = prescriptions || medicationEncounter.prescriptions;
    medicationEncounter.currentMedications = currentMedications || medicationEncounter.currentMedications;
    medicationEncounter.medicationUnderstanding = medicationUnderstanding || medicationEncounter.medicationUnderstanding;
    medicationEncounter.potentialDrugInteractions = potentialDrugInteractions || medicationEncounter.potentialDrugInteractions;
    medicationEncounter.potentialSideEffects = potentialSideEffects || medicationEncounter.potentialSideEffects;
    medicationEncounter.therapeuticAlternatives = therapeuticAlternatives || medicationEncounter.therapeuticAlternatives;
    medicationEncounter.pharmacologicalInterventions = pharmacologicalInterventions || medicationEncounter.pharmacologicalInterventions;
    medicationEncounter.nonPharmacologicalInterventions = nonPharmacologicalInterventions || medicationEncounter.nonPharmacologicalInterventions;
    medicationEncounter.followUp = followUp || medicationEncounter.followUp;
    medicationEncounter.intervention = intervention || medicationEncounter.intervention;
    medicationEncounter.recommendationToClinician = recommendationToClinician || medicationEncounter.recommendationToClinician;
    medicationEncounter.recommendationToPatient = recommendationToPatient || medicationEncounter.recommendationToPatient;
    medicationEncounter.goals = goals || medicationEncounter.goals;

    if (referral) {
      if (typeof referral === 'object') {
        // Validate and clean up referral.doctor
        if (referral.doctor && (typeof referral.doctor !== 'string' || !/^[0-9a-fA-F]{24}$/.test(referral.doctor))) {
          referral.doctor = null;
        }
      } else {
        referral = null;
      }
      medicationEncounter.referral = referral;
    }

    await medicationEncounter.save();

    // Handle updating user medications and prescriptions
    const patientId = medicationEncounter.user._id;

    const user = await User.findById(patientId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update medications and prescriptions arrays
    const newMedications = medications ? medications.map(item => {
      const updatedItem = { ...item };
      if (!updatedItem.medicationEncounterId) {
        updatedItem.medicationEncounterId = medicationEncounterId;
      }
      return updatedItem;
    }) : [];

    const newPrescriptions = prescriptions ? prescriptions.map(item => {
      const updatedItem = { ...item };
      if (!updatedItem.medicationEncounterId) {
        updatedItem.medicationEncounterId = medicationEncounterId;
      }
      return updatedItem;
    }) : [];

    const oldMedications = user.medications.filter(item => !item.medicationEncounterId.equals(medicationEncounterId));
    const oldPrescriptions = user.prescriptions.filter(item => !item.medicationEncounterId.equals(medicationEncounterId));

    user.medications = oldMedications.concat(newMedications);
    user.prescriptions = oldPrescriptions.concat(newPrescriptions);

    await user.save();

    res.status(200).json({
      message: "Medication encounter and user data updated successfully",
      medicationEncounter,
    });
  } catch (error) {
    console.error("Error updating medication encounter:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


exports.delete = async (req, res, next) => {
  try {
    const medicationEncounterId = req.params.medicationEncounterId;

    const medicationEncounter = await MedicationEncounter.findById(
      medicationEncounterId
    );

    if (!medicationEncounter) {
      return res.status(404).json({
        code: 404,
        message:
          "Medication encounter not found. Please check the provided ID.",
      });
    }

    const userId = medicationEncounter.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const newMedications = user.medications.filter(
      (item) => !item.medicationEncounterId.equals(medicationEncounterId)
    );

    const newPrescriptions = user.prescriptions.filter(
      (item) => !item.medicationEncounterId.equals(medicationEncounterId)
    );

    user.medications = newMedications;
    user.prescriptions = newPrescriptions;

    await user.save();

    await medicationEncounter.deleteOne();
    res.status(200).json({
      code: 200,
      message: "Medication encounter deleted successfully.",
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: medication_encounter.js:182 ~ exports.delete ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting medication encounter. Please try again later.",
    });
  }
};

exports.getById = async (req, res, next) => {
  const medicationEncounterId = req.params.medicationEncounterId;

  try {
    const medicationEncounter = await MedicationEncounter.findById(
      medicationEncounterId,
    )
      .populate("user")
      .populate("shop")
      .populate("reviewer");
    if (!medicationEncounter) {
      return res.status(400).json({
        code: 400,
        message: "Medication encounter not found",
      });
    }
    return res.status(200).json(medicationEncounter);
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error fetching medication encounter",
    });
  }
};

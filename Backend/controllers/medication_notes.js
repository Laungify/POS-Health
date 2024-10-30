const User = require("../models/user");
const Shop = require("../models/shop");
const ClinicalNotes = require("../models/medical_notes");
const mongoose = require("mongoose");

exports.create = async (req, res, next) => {
  try {
    const {
      shopId,
      userId,
      reviewerId,
      triageNotes,
      prescriptions = [],
      intervention,
      followUp,
      recommendationToPatient,
      recommendationToClinician,
    } = req.body;

    // Check for existence of shop and user
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
        message: "User not found",
      });
    }

    // Create new clinical note
    const newClinicalNote = new ClinicalNotes({
      user: userId,
      shop: shopId,
      reviewer: reviewerId,
      triageNotes,
      prescriptions,
      intervention,
      followUp,
      recommendationToPatient,
      recommendationToClinician,
    });

    await newClinicalNote.save();

    // Update user's medications (if applicable)
    if (Array.isArray(prescriptions)) {
      prescriptions.forEach(prescription => {
        if (Array.isArray(prescription.products)) {
          user.medications.unshift(...prescription.products);
        }
      });
      await user.save();
    }

    // Fetch and return the created clinical note with populated references
    const clinicalNote = await ClinicalNotes.findById(newClinicalNote._id)
      .populate("user")
      .populate("shop")
      .populate("reviewer");

    return res.status(201).json(clinicalNote);
  } catch (error) {
    console.error("Error creating clinical note:", error);
    res.status(500).json({
      code: 500,
      message: "Error creating clinical note",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const clinicalNoteId = req.params.clinicalNoteId;
    const { triageNotes, medications, intervention, followUp, recommendationToPatient, recommendationToClinician } = req.body;

    // Find the clinical note by its ID
    const clinicalNoteEncounter = await ClinicalNotes.findById(clinicalNoteId)
      .populate("user")
      .populate("shop")
      .populate("reviewer");

    if (!clinicalNoteEncounter) {
      return res.status(404).json({
        code: 404,
        message: "Clinical note encounter not found",
      });
    }

    const patientId = clinicalNoteEncounter.user._id;

    // Find the user associated with the clinical note
    const user = await User.findById(patientId);

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Database error",
      });
    }

    // Update the clinical note encounter fields
    Object.assign(clinicalNoteEncounter, req.body);
    await clinicalNoteEncounter.save();

    // Update the medications if provided
    if (medications) {
      const newMedications = medications.map((item) => {
        const updatedItem = { ...item };

        if (!updatedItem.clinicalNoteId) {
          updatedItem.clinicalNoteId = clinicalNoteId;
        }

        return updatedItem;
      });

      const oldMedications = user.medications.filter(
        (item) => !item.clinicalNoteId.equals(clinicalNoteId)
      );

      user.medications = oldMedications.concat(newMedications);
    }

    // Update the other fields for the user, if necessary
    if (triageNotes) {
      clinicalNoteEncounter.triageNotes = triageNotes
    }

    if (intervention) {
      clinicalNoteEncounter.intervention = intervention;
    }

    if (followUp) {
      clinicalNoteEncounter.followUp = followUp;
    }

    if (recommendationToPatient) {
      clinicalNoteEncounter.recommendationToPatient = recommendationToPatient;
    }

    if (recommendationToClinician) {
      clinicalNoteEncounter.recommendationToClinician = recommendationToClinician;
    }

    // Save the user with updated medications
    await user.save();

    // Respond with the updated clinical note encounter
    return res.status(200).json(clinicalNoteEncounter);
  } catch (error) {
    console.log(
      "🚀 ~ file: clinical_notes.js:XX ~ exports.update= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error updating clinical note",
    });
  }
};


exports.delete = async (req, res, next) => {
  try {
    const clinicalNoteId = req.params.clinicalNoteId;

    const clinicalNote = await ClinicalNotes.findById(clinicalNoteId);

    if (!clinicalNote) {
      return res.status(404).json({
        code: 404,
        message: "Clinical note not found. Please check the provided ID.",
      });
    }

    const userId = clinicalNote.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User associated with this clinical note not found.",
      });
    }

    // Remove this clinical note from user's medications if applicable
    user.medications = user.medications.filter(
      (item) => !item.medicationEncounterId.equals(clinicalNoteId)
    );

    await user.save();

    // Delete the clinical note
    await clinicalNote.deleteOne();
    res.status(200).json({
      code: 200,
      message: "Clinical note deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting clinical note:", error);
    res.status(500).json({
      code: 500,
      message: "Error deleting clinical note. Please try again later.",
    });
  }
};



exports.getById = async (req, res, next) => {
  const clinicalNoteId = req.params.clinicalNoteId;

  console.log(`Fetching clinical note with ID: ${clinicalNoteId}`);

  try {
    const clinicalNote = await ClinicalNotes.findById(clinicalNoteId)
      .populate("user")
      .populate("shop")
      .populate("reviewer");

    if (!clinicalNote) {
      return res.status(404).json({
        code: 404,
        message: "Clinical note not found",
      });
    }

    return res.status(200).json(clinicalNote);
  } catch (error) {
    console.error("Error fetching clinical note:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching clinical note",
    });
  }
};
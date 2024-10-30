const Staff = require("../models/staff");
const Appointment = require("../models/appointment");
const User = require("../models/user");
const emailService = require("../utils/emailService");
const mongoose = require("mongoose");

exports.create = async (req, res, next) => {
  try {
    const { userId, staffId, date, schedulerId } = req.body;

    if (!userId || !staffId || !date) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const doctor = await Staff.findById(mongoose.Types.ObjectId(staffId));

    if (!doctor) {
      return res.status(409).json({
        code: 409,
        message: "Doctor not found",
      });
    }

    const user = await User.findById(mongoose.Types.ObjectId(userId));
    if (!user) {
      return res.status(409).json({
        code: 409,
        message: "User not found",
      });
    }

    const appointment = new Appointment({
      user: userId,
      staff: staffId,
      ...req.body,
    });

    await appointment.save();

    if (schedulerId && schedulerId.toString() === userId.toString()) {
      //send to doctor

      const baseUrl = process.env.POS_CLIENT_URL;
      const data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: doctor.email,
        subject: "New appointment scheduled",
        html: `
          <h2>Hi, ${doctor.firstName}</h2>
          <p>You have a new appointment scheduled</p>
          <strong><a href="${baseUrl}/shops${doctor.shops[0].shop}/consultation">View Appointment</a></strong>`,
      };

      await emailService.sendMail(data);
    }
    if (schedulerId && schedulerId.toString() === staffId.toString()) {
      //send to patient

      const baseUrl = process.env.CLIENT_URL;
      const data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: user.email,
        subject: "New appointment scheduled",
        html: `
          <h2>Hi, ${user.firstName}</h2>
          <p>You have a new appointment scheduled</p>
          <strong><a href="${baseUrl}">View Appointment</a></strong>`,
      };

      await emailService.sendMail(data);
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(
      "🚀 ~ file: appointment.js:63 ~ exports.create= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error creating appointment",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const appointmentId = req.params.appointmentId;

    const appointment = await Appointment.findById(appointmentId)
      .populate("staff")
      .populate("user")
      .populate("medicalHistory");
    if (!appointment) {
      return res.status(404).json({
        code: 404,
        message: "Appointment not found",
      });
    }

    appointment = { ...req.body };

    await appointment.save();

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(
      "🚀 ~ file: appointment.js:119 ~ exports.update= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating appointment",
    });
  }
};

exports.getById = async (req, res, next) => {
  const appointmentId = mongoose.Types.ObjectId(req.params.appointmentId);

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("staff")
      .populate("user")
      .populate("medicalHistory");
    if (!appointment) {
      return res.status(400).json({
        code: 400,
        message: "Appointment not found",
      });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.log(
      "🚀 ~ file: appointment.js:86 ~ exports.getById= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching appointment",
    });
  }
};

exports.delete = async (req, res, next) => {
  const appointmentId = req.params.appointmentId;

  try {
    await Appointment.deleteOne({ _id: appointmentId });

    res
      .status(200)
      .json({ code: 200, message: "Appointment deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: appointment.js:108 ~ exports.delete ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting appointment",
    });
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const appointmentId = req.params.appointmentId;
    const { reason, userId, staffId } = req.body;

    if (!reason && (!userId || !staffId)) {
      return res.status(404).json({
        code: 404,
        message: "Missing required fields",
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate([
      "staff", "user", "medicalHistory"
    ]);
    if (!appointment) {
      return res.status(404).json({
        code: 404,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        code: 400,
        message: "Appointment is already canceled",
      });
    }

    appointment.status = "cancelled";

    if (userId) {
      appointment.cancellation = {
        reason,
        user: userId,
      };
    }

    if (staffId) {
      appointment.cancellation = {
        reason,
        staff: staffId,
      };
    }

    await appointment.save();

    const clientBaseUrl = process.env.CLIENT_URL;
    const posBaseUrl = process.env.POS_CLIENT_URL;

    if (staffId) {
      //send email to patient

      data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: appointment.user.email,
        subject: "Appointment cancelled",
        html: `
          <h2>Hi, ${appointment.user.firstName}</h2>
          <p>Your appointment with ${appointment.staff.firstName} on ${appointment.date
          } has been cancelled.</p>
          ${appointment.cancellation.reason
            ? `<p>Cancellation Reason: ${appointment.cancellation.reason}</p>`
            : ""
          }
          <strong><a href="${clientBaseUrl}">Afyabook</a></strong>
        `,
      };
    }

    if (userId) {
      //send email to doctor

      data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: appointment.staff.email,
        subject: "Appointment cancelled",
        html: `
          <h2>Hi, ${appointment.staff.firstName}</h2>
          <p>${appointment.user.firstName} cancelled the appointment at ${appointment.date
          }</p>
          ${appointment.cancellation.reason
            ? `<p>Cancellation Reason: ${appointment.cancellation.reason}</p>`
            : ""
          }
          <strong><a href="${posBaseUrl}/doctor/appointments">View Other Appointments</a></strong>
        `,
      };
    }

    await emailService.sendMail(data);

    return res.status(200).json(appointment);
  } catch (error) {
    console.log(
      "🚀 ~ file: appointment.js:270 ~ exports.cancel= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error canceling appointment",
    });
  }
};


function extractProperties(objects, ...properties) {
  // Your code here
}

// Test case
const objects = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }];
console.log(extractProperties(objects, 'a', 'c')); // Output: [{ a: 1, c: 3 }, { a: 4, c: 6 }]

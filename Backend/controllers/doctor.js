const Appointment = require("../models/appointment");
const Staff = require("../models/staff");

exports.getAll = async (req, res, next) => {
  try {
    const name = req.query.name || "";
    const specialty = req.query.specialty || "";
    const doctors = await Staff.find({
      "shops.roles": "doctor",
      $and: [
        {
          $or: [
            { firstName: { $regex: new RegExp(name, "i") } },
            { lastName: { $regex: new RegExp(name, "i") } },
          ],
        },
        {
          specialty: { $regex: new RegExp(specialty, "i") },
        },
      ],
    }).exec();

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching doctors",
    });
  }
};

exports.getById = async (req, res, next) => {
  const staffId = req.params.doctorId;

  try {
    const doctor = await Staff.findById(staffId);
    if (!doctor) {
      return res.status(400).json({
        code: 400,
        message: "Doctor not found",
      });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.log("🚀 ~ file: doctor.js:267 ~ exports.getById= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching doctor",
    });
  }
};

exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const totalAppointments = await Appointment.countDocuments({
      staff: doctorId,
    });

    const query = { doctor: doctorId };

    // Check if search query
    /* const searchQuery = req.query.search;
    if (searchQuery) {
      query.$or = [
        { "user.email": { $regex: searchQuery, $options: "i" } },
        { "user.firstName": { $regex: searchQuery, $options: "i" } }, 
        { "user.lastName": { $regex: searchQuery, $options: "i" } }, 
      ];
    } */

    const appointmentsQuery = limit
      ? Appointment.find(query)
          .skip(offset)
          .limit(limit)
          .populate("staff")
          .populate("user")
          .populate("medicalHistory")
      : Appointment.find(query)
          .populate("staff")
          .populate("user")
          .populate("medicalHistory");

    const appointments = await appointmentsQuery.exec();

    const pages = limit ? Math.ceil(totalAppointments / (limit || totalAppointments)) : 1;

    return res.status(200).json({
      data: appointments,
      paging: {
        total: totalAppointments,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: doctor.js:559 ~ exports.getDoctorAppointments= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching appointments",
    });
  }
};

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user");
const Token = require("../models/token");
const Product = require("../models/product");
const Prescription = require("../models/prescription");
const Order = require("../models/order");
const Appointment = require("../models/appointment");
const MedicationEncounter = require("../models/medication_encounter");
const Staff = require("../models/staff");
const Shop = require("../models/shop");
const { MedicalHistory } = require("../models/medical_history");
const uploadFile = require("../api/middleware/uploadPrescription");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");
const emailService = require("../utils/emailService");
const { jwt, signToken, decodeToken } = require("../utils/token");
const paginator = require("../utils/paginator");
const ClinicalNotes = require("../models/medical_notes");


exports.register = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      password,
      confirm,
      gender,
      dob,
      allergies,
      physicalAddress,
      nextOfKin,
    } = req.body;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !password ||
      !confirm
    ) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: "Password has to be at least 6 characters long",
      });
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        code: 400,
        message:
          "Password must contain an uppercase letter a lower case letter and a number",
      });
    }
    if (password !== confirm) {
      return res.status(400).json({
        code: 400,
        message: "Password and confirm do not match",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    if (!hash) {
      return res.status(500).json({
        code: 500,
        message: "Server error",
      });
    }

    const emailFound = await User.findOne({ email: email });
    if (emailFound) {
      return res.status(409).json({
        code: 409,
        message: "Email already exists",
      });
    }

    const user = new User({
      firstName,
      lastName,
      phoneNumber,
      email: email.toLowerCase(),
      password: hash,
    });

    await user.save();

    const code = crypto.randomBytes(16).toString("hex");

    const token = new Token({
      ownerId: user._id,
      code,
    });
    await token.save();

    const baseUrl = process.env.CLIENT_URL;

    const data = {
      from: '"Afyabook" <no-reply@afyabook.com>',
      to: email,
      subject: "Please verify your email address",
      html: `
        <h2>Hi,</h2>
        <p>Please verify your email by clicking on the following link</p>
        <strong><a href="${baseUrl}/?auth_token=${code}">Verify email</a></strong>`,
    };

    const authToken = signToken(user);

    const response = {
      user,
      token: authToken,
    };

    await emailService.sendMail(data);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error registering account",
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      code: 400,
      message: "Missing required fields",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    // if (!user.isEmailVerified) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "Please verify your email first",
    //   });
    // }

    if (user.googleId) {
      return res.status(400).json({
        code: 400,
        message: "Login with Google",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    //increment logins
    if (!user.loggedInCount) {
      user.loggedInCount = 0;
    }
    user.loggedInCount = user.loggedInCount + 1;
    user.save();

    const authToken = signToken(user);

    const response = {
      user,
      token: authToken,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 152 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.redirectToClient = async (req, res, next) => {
  try {
    return res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 152 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const user = req.user;
    const clientUrl = process.env.CLIENT_URL;

    if (!user.googleId) {
      //account exists
      return res.redirect(`${clientUrl}/login?conflict`);
    }

    const authToken = signToken(user);
    return res.redirect(`${clientUrl}/?token=${authToken}`);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 152 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.verifyLoginToken = async (req, res, next) => {
  try {
    const loginToken = req.params.token;

    const decoded = decodeToken(loginToken, process.env.JWT_KEY);

    const userId = decoded.sub;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const authToken = signToken(user);

    const response = {
      user,
      token: authToken,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 152 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const user = await User.find({});

    return res.status(200).json(user);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 152 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching users",
    });
  }
};

exports.getById = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("🚀 ~ file: user.js:315 ~ exports.getById= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching user",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      dob,
      nextOfKin,
      physicalAddress,
      occupation = { current: "", previous: "" },
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Email required",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }

    const emailFound = await User.findOne({
      email: email,
      _id: { $ne: user._id },
    });
    if (emailFound) {
      return res.status(409).json({
        code: 409,
        message: "Email already exists",
      });
    }

    const phoneFound = await User.findOne({
      phoneNumber: phoneNumber,
      _id: { $ne: user._id },
    });
    if (phoneFound) {
      return res.status(409).json({
        code: 409,
        message: "Phone number already exists",
      });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.gender = gender;
    user.dob = dob;
    user.nextOfKin = nextOfKin;
    user.physicalAddress = physicalAddress;
    user.occupation = occupation;

    if (user.email !== email) {
      user.isEmailVerified = false;
    }

    user.email = email;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating user",
    });
  }
};

exports.updatePhoneNumber = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const phoneFound = await User.findOne({
      phoneNumber: phoneNumber,
      _id: { $ne: user._id },
    });
    if (phoneFound) {
      return res.status(409).json({
        code: 409,
        message: "Phone number already exists",
      });
    }

    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating users phone number",
    });
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Email is required",
      });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    await Token.deleteMany({ ownerId: user._id });

    const token = await new Token({
      ownerId: user._id,
      code: crypto.randomBytes(32).toString("hex"),
    }).save();

    const link = `${process.env.CLIENT_URL}/Reset/?token=${token.code}`;

    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: email,
      subject: "Reset password link",
      html: `
        <h3>Hello ${user.firstName || ""},</h3>
        <p>Please reset your password by clicking on the following link</p>
        <strong><a href="${link}">Reset password</a></strong>`,
    };

    await emailService.sendMail(mail);
    res
      .status(200)
      .json({ code: 200, message: "Sent reset password link to your email" });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 314 ~ exports.requestCallBack= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error sending request",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirm } = req.body;
    if (!password || !confirm || !token) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: "Password has to be at least 6 characters long",
      });
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        code: 400,
        message:
          "Password must contain an uppercase letter a lower case letter and a number",
      });
    }
    if (password !== confirm) {
      return res.status(400).json({
        code: 400,
        message: "Password and confirm do not match",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    if (!hash) {
      return res.status(500).json({
        code: 500,
        message: "Server error",
      });
    }

    const code = await Token.findOne({
      code: token,
    });
    if (!code)
      return res.status(400).json({
        code: 400,
        message: "Invalid or expired link",
      });

    const user = await User.findById(code.ownerId);
    if (!user)
      return res.status(400).json({
        code: 400,
        message: "Invalid or expired link",
      });

    user.password = hash;
    await user.save();
    await code.delete();

    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: user.email,
      subject: "Password reset",
      html: `
        <h3>Hello ${user.firstName || ""},</h3>
        <p>Your password for Afyabook has been reset</p>`,
    };

    await emailService.sendMail(mail);
    res.status(200).json({ code: 200, message: "Password reset successfully" });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 314 ~ exports.requestCallBack= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error resetting password",
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({
      code: 400,
      message: "Missing required fields",
    });
  }

  try {
    const tokenFound = await Token.findOne({ code: token });
    if (!tokenFound) {
      return res.status(400).json({
        code: 400,
        message: "Email verification failed. Please try again",
      });
    }

    const userId = tokenFound.ownerId;
    const user = await User.findById(userId);
    const tokenId = tokenFound.id;

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Email verification failed. Please try again",
      });
    }

    user.isEmailVerified = true;
    user.save();
    await Token.deleteOne({ _id: tokenId });

    const authToken = signToken(user);

    res.status(200).json({
      user: user,
      token: authToken,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error verifying email",
    });
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let query = { "patient": userId };
    if (limit > 0) {
      query = Order.find(query).skip(offset).limit(limit);
    } else {
      query = Order.find(query);
    }

    const ordersCollection = await query.sort({ createdAt: "desc" });

    const ordersCollectionCount = await Order.where({
      "patient": userId,
    }).countDocuments();

    const totalPages =
      limit !== 0 ? Math.ceil(ordersCollectionCount / limit) : 1;

    res.status(200).json({
      data: ordersCollection,
      paging: {
        total: ordersCollectionCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 697 ~ exports.getDistributorOrders= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching orders",
    });
  }
};

exports.getUserPrescription = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const prescriptionsCollection = await Prescription.find({
      "patient": userId,
    })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: "desc" });

    const prescriptionsCollectionCount = await Prescription.where({
      "patient": userId,
    }).countDocuments();

    const totalPages =
      limit !== 0 ? Math.ceil(prescriptionsCollectionCount / limit) : 1;

    res.status(200).json({
      data: prescriptionsCollection,
      paging: {
        total: prescriptionsCollectionCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 697 ~ exports.getDistributorOrders= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching orders",
    });
  }
};

exports.getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const query = { user: userId };

    const totalAppointments = await Appointment.countDocuments(query);

    const appointmentsQuery = limit
      ? Appointment.find(query)
        .skip(offset)
        .limit(limit)
        .populate(["staff", "user", "medicalHistory"])
      : Appointment.find(query).populate(["staff", "user", "medicalHistory"]);

    const appointments = await appointmentsQuery.exec();

    const pages = limit
      ? Math.ceil(totalAppointments / (limit || totalAppointments))
      : 1;

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
      "🚀 ~ file: user.js:832 ~ exports.getUserAppointments= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching appointments",
    });
  }
};

exports.getUserMedicationEncounters = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const totalMedicationEncounters = await MedicationEncounter.countDocuments(
       userId
    );

    const query = { user: userId };

    const medicationEncounters = await MedicationEncounter.find(query)
      .populate("user")
      .populate("shop")
      .populate("reviewer")
      .populate("referral.doctor")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    medicationEncounters.forEach((encounter) => {
      encounter.medications = user.medications.filter((medication) =>
        medication.medicationEncounterId.equals(encounter._id)
      );
      encounter.prescriptions = user.prescriptions.filter((prescription) =>
        prescription.medicationEncounterId.equals(encounter._id)
      );
    });

    const pages = Math.ceil(
      totalMedicationEncounters / (limit || totalMedicationEncounters)
    );

    return res.status(200).json({
      data: medicationEncounters,
      paging: {
        total: totalMedicationEncounters,
        page,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching medication encounters:", error);
    return res.status(500).json({
      code: 500,
      message: "Error fetching medication encounters",
    });
  }
};

exports.getUserVitals = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const vitals = user.vitals;

    return res.status(201).json(vitals);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:890 ~ exports.getUserVitals= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error fetching vitals",
    });
  }
};

exports.createUserVitals = async (req, res, next) => {
  try {
    const {
      height,
      weight,
      systolic,
      diastolic,
      oxygen,
      pulse,
      randomBloodSugar,
      fastingBloodSugar,
      hbA1c,
      ldl,
      hdl,
      respiration,
      creatinine,
      eGFR,
      inr,
      comment,
    } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const vitals = {
      height,
      weight,
      systolic,
      diastolic,
      oxygen,
      pulse,
      randomBloodSugar,
      fastingBloodSugar,
      hbA1c,
      ldl,
      hdl,
      respiration,
      creatinine,
      eGFR,
      inr,
      comment
    };

    user.vitals.push(vitals)

    //console.log("user", user)

    await user.save();

    return res.status(201).json(vitals);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:912 ~ exports.createUserVitals= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error adding vitals",
    });
  }
};

//TODO need to be updated to update vital - ibra

exports.updateUserVitals = async (req, res, next) => {
  try {
    const {
      height,
      weight,
      systolic,
      diastolic,
      oxygen,
      pulse,
      randomBloodSugar,
      fastingBloodSugar,
      hbA1c,
      ldl,
      hdl,
      respiration,
      creatinine,
      eGFR,
      inr,
      comment,
    } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const vitals = {
      height,
      weight,
      systolic,
      diastolic,
      oxygen,
      pulse,
      randomBloodSugar,
      fastingBloodSugar,
      hbA1c,
      ldl,
      hdl,
      respiration,
      creatinine,
      eGFR,
      inr,
      comment,
      patient,
    };

    user.vitals = vitals;

    return res.status(201).json(vitals);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:912 ~ exports.createUserVitals= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error updating vitals",
    });
  }
};

exports.deleteUserVitals = async (req, res, next) => {
  try {
    //const userId = req.params.userId;
    const { userId, vitalsId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    // Find the index of the vitals object with the given vitalsId
    const vitalsIndex = user.vitals.findIndex(vital => vital._id.toString() === vitalsId);

    if (vitalsIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: "Vitals not found",
      });
    }

    // Remove the vitals object at the found index
    user.vitals.splice(vitalsIndex, 1);

    // Save the updated user document
    await user.save();



    //user.vitals = [];

    return res
      .status(200)
      .json({ code: 200, message: "Vitals deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:1050 ~ exports.deleteUserVitals ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error deleting vitals",
    });
  }
};


exports.getUserClinicalEncounters = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 0;  
    const offset = parseInt(req.query.offset) || 0; 

    const clinicalNotesQuery = ClinicalNotes.find()
      .populate('user')       
      .populate('shop')       
      .populate('reviewer')    
      .sort({ createdAt: -1 }) 
      .skip(offset)            
      .limit(limit)          
      .lean();                

    const clinicalNotes = await clinicalNotesQuery.exec();

    // console.log('Clinical Notes:', clinicalNotes.length, clinicalNotes);

    res.status(200).json(clinicalNotes);

  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    res.status(500).json({ error: 'An error occurred while fetching clinical notes' });
  }
};

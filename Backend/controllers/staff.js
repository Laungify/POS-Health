const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Company = require("../models/company");
const Shop = require("../models/shop");
const Staff = require("../models/staff");
const Transfer = require("../models/transfer");
const Token = require("../models/token");
const Appointment = require("../models/appointment");
const emailService = require("../utils/emailService");
const { jwt, signToken, decodeToken } = require("../utils/token");
const paginator = require("../utils/paginator");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");
const uploadFile = require("../api/middleware/uploadFile");

function rangesOverlap(range1, range2) {
  const start1 = new Date(range1.start);
  const end1 = new Date(range1.end);
  const start2 = new Date(range2.start);
  const end2 = new Date(range2.end);

  return start1 < end2 && end1 > start2;
}

exports.create = async (req, res, next) => {
  try {
    const { email, shopId, roles, firstName, lastName, phoneNumber } = req.body;

    if (
      !email ||
      !shopId ||
      !roles ||
      !firstName ||
      !lastName ||
      !phoneNumber
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

    const shop = await Shop.findById(shopId).populate("staff.member");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const shopStaff = shop.staff;
    // console.log("shopStaff", shopStaff)
    const staffFound = shopStaff.find(
      (staff) =>
        staff.member.email === email || staff.member.phoneNumber === phoneNumber
    );
    if (staffFound) {
      return res.status(400).json({
        code: 400,
        message: "Staff already exists",
      });
    }

    const oldStaff = await Staff.findOne({
      email: email,
      phoneNumber: phoneNumber,
    });
    if (oldStaff) {
      //staff was added by another company, update
      const staffId = oldStaff._id;

      oldStaff.shops.unshift({
        shop: shopId,
        roles,
      });

      await oldStaff.save();

      shop.staff.unshift({
        member: staffId,
        roles,
      });

      shop.save();

      return res.status(200).json({
        message: "Success",
      });
    } else {
      // staff does not exist, invite

      const staffId = mongoose.Types.ObjectId();

      const code = crypto.randomBytes(16).toString("hex");

      const token = new Token({ ownerId: staffId, code });

      await token.save();

      const staffShop = {
        shop: shopId,
        roles,
      };

      const staff = new Staff({
        _id: staffId,
        email:email.toLowerCase(),
        firstName,
        lastName,
        phoneNumber,
        shops: [staffShop],
      });

      await staff.save();

      shop.staff.unshift({
        member: staffId,
        roles,
      });

      shop.save();
      console.log("🚀 ~ file: staff.js:119 ~ exports.create= ~ shop:", shop);

      const baseUrl = process.env.POS_CLIENT_URL;

      const data = {
        from: '"Afya Book" <no-reply@afyabook.com>',
        to: email,
        subject: `Join ${shop.name}`,
        html: `
          <h2>Hi ${firstName},</h2>
          <p>You have been invited to join ${shop.name} on Afyabook</p>
          <p>Click <strong><a href="${baseUrl}/verify_staff/${token.code}">here</a></strong> to join now.</p>
          `,
      };

      await emailService.sendMail(data);

      return res.status(200).json({
        message: "Sent verification link to staff email",
      });
    }
  } catch (error) {
    console.log("🚀 ~ file: staff.js:129 ~ exports.create= ~ error:", error);

    res.status(500).json({
      code: 500,
      message: "Error adding staff",
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
    const staff = await Staff.findOne({ email }).populate("company");
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, staff.password);
    if (!match) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    const authToken = signToken(staff);

    return res.status(200).json({
      staff: staff,
      token: authToken,
    });
  } catch (error) {
    console.log("🚀 ~ file: staff.js:190 ~ exports.login= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    await uploadFile(req, res);

    let profileImage = "";
    if (req.file) {
      const cloudinaryImage = await uploadToCloudinary(
        req.file.path,
        "staff_profiles"
      );
      profileImage = cloudinaryImage.secure_url;
    }

    const staffId = req.params.staffId;
    const {
      shopId,
      email,
      firstName,
      lastName,
      phoneNumber,
      education = [],
      languages = [],
      roles = [],
    } = req.body;

    if (!email || !firstName || !lastName || !phoneNumber) {
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

    const emailFound = await Staff.findOne({
      email: email,
      _id: { $ne: staffId },
    });
    if (emailFound) {
      return res.status(409).json({
        code: 409,
        message: "Email already exists",
      });
    }

    const phoneFound = await Staff.findOne({
      phoneNumber: phoneNumber,
      _id: { $ne: staffId },
    });
    if (phoneFound) {
      return res.status(409).json({
        code: 409,
        message: "Phone number already exists",
      });
    }

    const updates = { ...req.body, education, languages };

    if (profileImage) {
      updates.profileImage = profileImage;
    }

    const updatedStaff = await Staff.findByIdAndUpdate(staffId, updates, {
      new: true,
    });

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (shopId) {
      const shopIndex = updatedStaff.shops.findIndex(
        (item) => item.shop.toString() === shopId
      );

      if (shopIndex !== -1) {
        updatedStaff.shops[shopIndex].roles = roles;
        updatedStaff.save();
      }

      const shop = await Shop.findById(mongoose.Types.ObjectId(shopId));

      const staffIndex = shop.staff.findIndex(
        (item) => item.member.toString() === updatedStaff._id.toString()
      );

      if (staffIndex !== -1) {
        shop.staff[staffIndex].roles = roles;
        shop.save();
      }
    }

    return res.status(200).json(updatedStaff);
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 42 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating staff",
    });
  }
};

exports.getById = async (req, res, next) => {
  const staffId = req.params.staffId;

  try {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.log("🚀 ~ file: staff.js:253 ~ exports.getById= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error fetching staff",
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const shops = await Shop.find({});

    res.status(200).json(shops);
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 169 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shops",
    });
  }
};

exports.delete = async (req, res, next) => {
  const staffId = req.params.staffId;
  const shopId = req.params.shopId;

  try {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    /* await Staff.deleteOne({ _id: staffId }); */

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const newStaff = shop.staff.filter(
      (i) => i.member.toString() !== mongoose.Types.ObjectId(staffId).toString()
    );

    shop.staff = newStaff;
    shop.save();

    const newShops = staff.shops.filter(
      (i) => i.shop.toString() !== mongoose.Types.ObjectId(shopId).toString()
    );
    staff.shops = newShops;
    staff.save();

    res.status(200).json({ code: 200, message: "Staff deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 195 ~ exports.delete ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting staff",
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const verificationToken = await Token.findOne({ token: token });
    if (!verificationToken) {
      return res.status(400).json({
        code: 400,
        message: "1Email verification failed. Please try again",
      });
    }

    const tokenId = verificationToken._id;
    const staffId = verificationToken.ownerId;
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "2Email verification failed. Please try again",
      });
    }

    staff.isEmailVerified = true;
    staff.save();
    await Token.deleteOne({ _id: tokenId });

    const authToken = signToken(staff);

    res.status(200).json({
      staff: staff,
      token: authToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error verifying email",
    });
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    const { code, password, confirm } = req.body;

    if (!code || !password || !confirm) {
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

    const token = await Token.findOne({ code });
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Invite expired or is invalid. Please try again",
      });
    }

    const tokenId = token._id;
    const staffId = token.ownerId;
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Invite expired or is invalid. Please try again",
      });
    }

    if (staff.password) {
      return res.status(400).json({
        code: 400,
        message: "Password already set. Please log in",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    staff.isEmailVerified = true;
    staff.password = hash;
    staff.save();
    await Token.deleteOne({ _id: tokenId });

    const authToken = signToken(staff);

    res.status(200).json({
      staff: staff,
      token: authToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error setting password, please try again.",
    });
  }
};

exports.reinviteStaff = async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({
      code: 400,
      message: "Missing required fields",
    });
  }

  try {
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Account not found",
      });
    }

    if (staff.password) {
      return res.status(400).json({
        code: 400,
        message: "Password already set. Please log in",
      });
    }

    const code = crypto.randomBytes(16).toString("hex");

    const token = new Token({ ownerId: staff._id, code });

    await token.save();

    const baseUrl = process.env.POS_CLIENT_URL;

    const data = {
      from: '"Afya Book" <no-reply@afyabook.com>',
      to: email,
      subject: `Join ${staff.shops[0].name}`,
      html: `
        <h2>Hi ${staff.firstName},</h2>
        <p>You have been invited to join ${staff.shops[0].name} on Afyabook</p>
        <p>Click <strong><a href="${baseUrl}/verify-staff/${token.code}">here</a></strong> to join now.</p>
        `,
    };

    await emailService.sendMail(data);

    res.status(200).json({ message: "Successfully resent invite" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error resending invite",
    });
  }
};

exports.getStaffShops = async (req, res, next) => {
  try {
    const staffId = req.params.staffId;

    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const staff = await Staff.findById(staffId).populate("shops.shop");
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const shops = staff.shops;

    const items = paginator(shops);

    const shopsCollection = items.data;

    const shopsCollectionCount = items.total;
    const totalPages = items.totalPages;

    res.status(200).json({
      data: shopsCollection,
      paging: {
        total: shopsCollectionCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching staff shops",
    });
  }
};

exports.getShopStaff = async (req, res, next) => {
  try {
    const shopId = req.params.shopId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    /* let shopStaff = shop.staff;

    //TODO: paginate shopStaff

    const shopStaffCount = shopStaff.length;

    const totalPages = limit !== 0 ? Math.ceil(shopStaffCount / limit) : 1;

    res.status(200).json({
      data: shopStaff,
      paging: {
        total: shopStaffCount,
        page: page,
        pages: totalPages,
      },
    }); */
    const shopStaff = await Staff.find({ "shop._id": shopId })
      .skip(offset)
      .limit(limit);

    const shopStaffCount = await Staff.find({
      "shop._id": shopId,
    }).countDocuments();

    const totalPages = limit !== 0 ? Math.ceil(shopStaffCount / limit) : 1;

    res.status(200).json({
      data: shopStaff,
      paging: {
        total: shopStaffCount,
        page: page,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: shop.js ~ line 54 ~ exports.getAll= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching shop staff",
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
    const staff = await Staff.findOne({ email });

    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    await Token.deleteMany({ ownerId: staff._id });

    const token = await new Token({
      ownerId: staff._id,
      code: crypto.randomBytes(32).toString("hex"),
    }).save();

    const link = `${process.env.POS_CLIENT_URL}/reset_password/?token=${token.code}`;

    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: email,
      subject: "Reset password link",
      html: `
        <h3>Hello ${staff.firstName || ""},</h3>
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

    const staff = await Staff.findById(code.ownerId);

    if (!staff)
      return res.status(400).json({
        code: 400,
        message: "Invalid or expired link",
      });

    staff.password = hash;

    await staff.save();

    await code.delete();

    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: staff.email,
      subject: "Password reset",
      html: `
        <h3>Hello ${staff.firstName || ""},</h3>
        <p>Your password for Afyabook has been reset</p>`,
    };

    await emailService.sendMail(mail);
    res.status(200).json({ code: 200, message: "Password reset successfully" });
  } catch (error) {
    console.log(
      "🚀 ~ file: staff.js:770 ~ exports.resetPassword= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error resetting password",
    });
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const staffId = req.params.staffId;
    const limit = parseInt(req.query.limit) || 0;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const totalAppointments = await Appointment.countDocuments({
      doctor: staffId,
    });

    const query = { doctor: staffId };

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
        .populate(["staff", "user", "medicalHistory"])
      : Appointment.find(query).populate(["staff", "user", "medicalHistory"]);

    const appointments = await appointmentsQuery.exec();

    const pages = Math.ceil(totalAppointments / (limit || totalAppointments));

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

exports.addAvailability = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { schedule, range } = req.body;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found",
      });
    }

    const staffAvailability = staff.availability;

    //check for conflicting range
    const conflictingRange = staffAvailability.find((availability) =>
      rangesOverlap(availability.range, range)
    );

    if (conflictingRange) {
      return res.status(400).json({
        code: 400,
        message: "Conflicting availability range",
      });
    }

    staffAvailability.unshift({ schedule, range });

    // Mark the modified path for Mongoose
    staff.markModified("availability");

    await staff.save();

    res.status(201).json(staffAvailability);
  } catch (error) {
    console.log(
      "🚀 ~ file: staff.js:893 ~ exports.addAvailability= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error adding availability",
    });
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { staffId, availabilityId } = req.params;
    const { schedule, range } = req.body;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found",
      });
    }

    const staffAvailability = staff.availability.id(availabilityId);

    if (!staffAvailability) {
      return res.status(404).json({
        code: 404,
        message: "Availability not found",
      });
    }

    //check for conflicting range
    const conflictingRange = staff.availability.find(
      (availability) =>
        availability.id !== availabilityId &&
        rangesOverlap(availability.range, range)
    );

    if (conflictingRange) {
      return res.status(400).json({
        code: 400,
        message: "Conflicting availability range",
      });
    }

    staffAvailability.schedule = schedule;
    staffAvailability.range = range;

    // Mark the modified path for Mongoose
    staff.markModified("availability");

    await staff.save();

    res.status(201).json(staffAvailability);
  } catch (error) {
    console.log(
      "🚀 ~ file: staff.js:934 ~ exports.updateAvailability= ~ error:",
      error
    );

    res.status(500).json({
      code: 500,
      message: "Error updating availability",
    });
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found",
      });
    }

    const staffAvailability = staff.availability;

    await staff.save();

    res.status(201).json(staffAvailability);
  } catch (error) {
    console.log(
      "🚀 ~ file: doctor.js:664 ~ exports.setAvailability= ~ error:",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching availability",
    });
  }
};

exports.deleteAvailability = async (req, res, next) => {
  const { staffId, availabilityId } = req.params;

  try {
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        code: 404,
        message: "Staff not found",
      });
    }

    const staffAvailability = staff.availability;

    const indexToDelete = staffAvailability.findIndex(
      (item) => item._id.toString() === availabilityId.toString()
    );

    if (indexToDelete === -1) {
      return res.status(404).json({
        code: 404,
        message: "Availability not found",
      });
    }

    staffAvailability.splice(indexToDelete, 1);

    await staff.save();

    res
      .status(200)
      .json({ code: 200, message: "Availability deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Error deleting availability",
    });
  }
};

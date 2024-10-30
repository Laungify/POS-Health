const bcrypt = require("bcrypt");
const Company = require("../models/company");
const Product = require("../models/product");
const Staff = require("../models/staff");
const { signToken } = require("../utils/token");

exports.create = async (req, res, next) => {
  try {
    const { name, owner } = req.body;
    if (!name || !owner) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const { firstName, lastName, email, phoneNumber, password, confirm } =
      owner;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirm
    ) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Company name has to be at least 2 characters long",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email is not valid",
      });
    }

    if (firstName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "First name has to be at least 2 characters long",
      });
    }
    if (lastName.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "Last name has to be at least 2 characters long",
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

    const companyNameFound = await Company.findOne({
      name: name,
    });
    if (companyNameFound) {
      return res.status(409).json({
        code: 409,
        message: "Company name already exists",
      });
    }

    const emailFound = await Staff.findOne({
      email,
    });
    if (emailFound) {
      return res.status(409).json({
        code: 409,
        message: "Email already exists",
      });
    }

    const phoneFound = await Staff.findOne({
      phoneNumber,
    });
    if (phoneFound) {
      return res.status(409).json({
        code: 409,
        message: "Phone number already exists",
      });
    }

    const staff = new Staff({
      email: email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      password: hash,
    });

    await staff.save();

    const ownerId = staff._id;

    const contact = req.body?.contact || owner;

    const company = new Company({
      name,
      owner: ownerId,
      contact,
    });

    await company.save();

    staff.company = company._id;

    staff.save();

    const authToken = signToken(ownerId);

    const response = {
      company,
      staff,
      token: authToken,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("🚀 ~ file: company.js:173 ~ exports.create= ~ error:", error);
    res.status(500).json({
      code: 500,
      message: "Error creating company",
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
    const company = await Company.findOne({ "owner.email": email }).populate(
      "owner"
    );
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, company.owner.password);
    if (!match) {
      return res.status(400).json({
        code: 400,
        message: "Invalid email or password",
      });
    }

    const authToken = signToken(company.owner);

    const response = {
      company,
      token: authToken,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(
      "🚀 ~ file: seller.js ~ line 186 ~ exports.login= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error login in",
    });
  }
};

exports.update = async (req, res, next) => {
  const companyId = req.params.companyId;
  const { name, owner } = req.body;
  if (!name || !owner) {
    return res.status(400).json({
      code: 400,
      message: "Missing required fields",
    });
  }

  const { firstName, lastName, email, phoneNumber } = owner;

  if (!firstName || !lastName || !email || !phoneNumber) {
    return res.status(400).json({
      code: 400,
      message: "Missing required fields",
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      code: 400,
      message: "Company name has to be at least 2 characters long",
    });
  }

  if (firstName.length < 2) {
    return res.status(400).json({
      code: 400,
      message: "First name has to be at least 2 characters long",
    });
  }
  if (lastName.length < 2) {
    return res.status(400).json({
      code: 400,
      message: "Last name has to be at least 2 characters long",
    });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }

    const companyNameFound = await Company.findOne({
      name: name,
      _id: { $ne: companyId },
    });
    if (companyNameFound) {
      return res.status(409).json({
        code: 409,
        message: "Company name already exists",
      });
    }

    const emailFound = await Company.findOne({
      "owner.email": email,
      _id: { $ne: company.owner._id },
    }).populate("owner");
    if (emailFound) {
      return res.status(409).json({
        code: 409,
        message: "Email already exists",
      });
    }

    const phoneFound = await Company.findOne({
      "owner.phoneNumber": phoneNumber,
      _id: { $ne: company.owner._id },
    });
    if (phoneFound) {
      return res.status(409).json({
        code: 409,
        message: "Phone number already exists",
      });
    }

    company.name = name;
    company.owner = { ...req.body };
    company.save();

    return res.status(200).json(company);
  } catch (error) {
    console.log(
      "🚀 ~ file: company.js ~ line 249 ~ exports.edit= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating company",
    });
  }
};

exports.getById = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const company = await Company.findById(companyId).populate("owner");
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }
    res.status(200).json(companyId);
  } catch (error) {
    console.log(
      "🚀 ~ file: company.js ~ line 217 ~ exports.getById= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching company",
    });
  }
};

exports.getCompanyProducts = async (req, res, next) => {
  const companyId = req.params.companyId;
  //TODO: paginate

  try {
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }

    const products = await Product.find({
      "shop.company._id": companyId,
    }).populate("shop");

    res.status(200).json(products);
  } catch (error) {
    console.log(
      "🚀 ~ file: company.js ~ line 101 ~ exports.getCompanyProduct= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching company products",
    });
  }
};

exports.getCompanyShops = async (req, res, next) => {
  const companyId = req.params.companyId;
  //TODO: paginate

  try {
    const company = await Company.findById(companyId).populate("shops");

    if (!company) {
      return res.status(400).json({
        code: 400,
        message: "Company not found",
      });
    }

    const shops = company.shops;

    res.status(200).json(shops);
  } catch (error) {
    console.log(
      "🚀 ~ file: company.js ~ line 101 ~ exports.getCompanyShops= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching company products",
    });
  }
};

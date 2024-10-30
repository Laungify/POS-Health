const mongoose = require("mongoose");
const Company = require("./models/company");
const Company_Copy = require("./models/company_copy");
const Shop = require("./models/shop");
const Shop_Copy = require("./models/shop_copy");
const Staff = require("./models/staff");
const Staff_Copy = require("./models/staff_copy");
const Product = require("./models/product");
const Product_Copy = require("./models/product_copy");
const User = require("./models/user");

module.exports = connection = async () => {
  const mongoDB = process.env.MONGODB_URI;

  try {
    const connectionParams = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
    await mongoose.connect(mongoDB, connectionParams);
    console.log("connected to database.");

    /*  const companies = await Company_Copy.find({});

    companies.forEach((company) => {
      const shopIds = company.shops.map((shop) => {
        return shop._id;
      });
      const newDocument = { ...company.toObject(), shops: shopIds };

      const newModelInstance = new Company(newDocument);
      newModelInstance.save();

      const admin = company.admin;
      new Staff({ ...admin });
    }); */

    /*    const shops = await Shop_Copy.find({});

    shops.forEach(async (shop) => {
      const staff = shop.staff.map((staffMember) => {
        return { roles: staffMember.role, member: staffMember._id };
      });

      const patients = shop.patients.map((patient) => {
        return { patient: patient._id };
      });

      const physicalAddress = {
        county: shop.location,
        street: shop.streetLocation,
      };
      const contact = { email: shop.email, phoneNumber: shop.phone };

      const shopCompany = await Company.findById(shop.company);
      const shopAdmin = shopCompany.admin;

      staff.push({
        member: shopAdmin,
        roles: ["admin"],
      });

      const uniqueMembersSet = new Set();

      const uniqueStaff = staff.filter((staffMember) => {
        const key = staffMember.member.toString();

        if (!uniqueMembersSet.has(key)) {
          uniqueMembersSet.add(key);
          return true;
        }

        return false;
      });

      const newDocument = {
        ...shop.toObject(),
        staff: uniqueStaff,
        patients,
        physicalAddress,
        contact,
      };

      const newModelInstance = new Shop(newDocument);
      newModelInstance.save();
    }); */

    /*  const staff = await Staff_Copy.find({});

    staff.forEach(async (member) => {
      const shops = member.shops.map((shop) => {
        return { roles: shop.role, shop: shop._id };
      });

      const newDocument = {
        ...member.toObject(),
        shops,
      };

      const newModelInstance = new Staff(newDocument);
      newModelInstance.save();
    }); */

    /*   const products = await Product_Copy.find({});

    products.forEach(async (product) => {
      const newDocument = JSON.parse(JSON.stringify(product));

      newDocument.productImage = newDocument.image;
      newDocument.shop.physicalAddress = newDocument.shop.location;

      const newModelInstance = new Product(newDocument);
      await newModelInstance.save();
    }); */
  } catch (error) {
    console.log(
      "🚀 ~ file: db.js:92 ~ module.exports=connection= ~ error:",
      error
    );
  }
};

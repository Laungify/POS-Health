const User = require("../models/user");
const Product = require("../models/product");
const Prescription = require("../models/prescription");
const Shop = require("../models/shop");
const Staff = require("../models/staff");
const uploadFile = require("../api/middleware/uploadPrescription");
const uploadToCloudinary = require("../api/middleware/uploadToCloudinary");
const userSockets = require("../userSockets");
const emailService = require("../utils/emailService");
const smsService = require("../utils/smsService")


// function to send push notification to customer

async function sendNotificationToCustomer(recipients, message, heading) {
  const notification = {
    app_id: process.env.ONESIGNAL_APP_ID_POS,
    contents: { en: message },
    // include_player_ids: [recipients],
    headings: { en: heading },
    // included_segments: ['Total Subscriptions'],
    target_channel: "push",
    include_external_user_ids: [recipients],
  };

  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`
  };


  // send notification using the OneSignal client
  try {
    const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, { headers });
    //console.log('Notification sent customer:', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error sending notification customer:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('No response received customer:', error.request);
      return { error: 'No response received' };
    } else {
      console.error('Error:', error.message);
      return { error: error.message };
    }


  }

}


// function to send push notification to pharmacy

async function sendNotificationToPOS(recipients, message, heading) {
  const notification = {
    app_id: process.env.ONESIGNAL_APP_ID_POS,
    contents: { en: message },
    // include_player_ids: [recipients],
    headings: { en: heading },
    // included_segments: ['Total Subscriptions'],
    target_channel: "push",
    include_external_user_ids: [recipients],

  };

  const apiKey = process.env.ONESIGNAL_REST_API_KEY_POS;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`
  };


  // send notification using the OneSignal client
  try {
    const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, { headers });
    //console.log('Notification sent pos:', response);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error sending notification pos:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      ``
      console.error('No response received pos:', error.request);
      return { error: 'No response received' };
    } else {
      console.error('Error:', error.message);
      return { error: error.message };
    }


  }

}

// event listener for quoted order to customer
function onPrescriptionQuoted(recipients) {
  // send push notification to the customer
  const message = "Your prescription has been quoted.";
  const heading = "Order status";
  sendNotificationToCustomer(recipients, message, heading);
}

// event listener for cancelled order customer
function onPrescriptionCancel(recipients) {
  // send push notification to the customer
  const message = "Your prescription has been cancelled.";
  const heading = "Order status";
  sendNotificationToCustomer(recipients, message, heading);
}

// event listener for cancelled order pos
function onPrescriptionCancelPos(recipients) {
  // send push notification to the pos
  const message = "A prescription has been cancelled.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

// event listener for created order
function onPrescriptionCreated(recipients) {
  // send push notification to the pos
  const message = "A prescription has been created.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);

}

// event listener for received order
function onPrescriptionReceived(recipients) {
  const message = "A prescription has been received.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

// event listener for confirmed order
function onPrescriptionConfirmed(recipients) {
  const message = "A prescription has been confirmed.";
  const heading = "Order status";
  sendNotificationToPOS(recipients, message, heading);
}

exports.create = async (req, res, next) => {
  try {
    await uploadFile(req, res);

    console.log("req.body", req.body)
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "Please upload a prescription",
      });
    }
    const { patientId, shopId } = req.body;

    if (!patientId || !shopId) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const cloudinaryImage = await uploadToCloudinary(
      req.file.path,
      "prescriptions"
    );

    const prescription = new Prescription({
      patient: patient._id,
      shop: shop._id,
      url: cloudinaryImage.secure_url,
    });

    await prescription.save();

    const smsNewPrescription = `Hello ${shop.name || "team"},\n\n` +
      `A prescription has been uploaded to your pharmacy.\n` +
      `View the prescription details at: ${baseUrl}\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: shop.contact.phoneNumber,
      message: smsNewPrescription,
      from: 'Afyabook',
    });


    const baseUrl = process.env.POS_CLIENT_URL;

    const email = shop?.contact?.email || "";

    if (email) {
      const data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: email,
        subject: "New Prescription",
        html: `
          <h3>Hello ${shop.name} team,</h3>
          <p>A prescription has been uploaded to your pharmacy</p>
          <strong><a href="${baseUrl}">View Prescription</a></strong>`,
      };

      await emailService.sendMail(data);
    }

    const smsAdminMessage = `Hello ${shop.name || "team"},\n\n` +
      `A prescription has been uploaded to your pharmacy.\n` +
      `View the prescription details at: ${baseUrl}\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: process.env.ADMINPHONENUMBER,
      message: smsAdminMessage,
      from: 'Afyabook',
    });


    const adminEmail = process.env.ADMINEMAIL;

    const dataAdmin = {
      from: '"Afyabook" <no-reply@afyabook.com>',
      to: adminEmail,
      subject: "New Prescription",
      html: `
        <h3>Hello ${shop.name || ""} team,</h3>
        <p>A prescription has been uploaded to your pharmacy</p>
        <strong><a href="${baseUrl}">View Prescription</a></strong>`,
    };

    await emailService.sendMail(dataAdmin);

    const smsMessage = `A prescription has been uploaded to ${shop.name || 'your pharmacy'}. View it at ${baseUrl}`;
    await smsService.SMS.send({
      to: process.env.TO_PHONE,
      message: smsMessage,
      from: 'Afyabook',
    });


    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onPrescriptionCreated(personId)

      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("prescriptionUploaded");
      }
    });

    res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js ~ line 105 ~ exports.create= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error uploading prescription",
    });
  }
};

exports.sendSms = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    const smsMessage = `A prescription has been uploaded to Patameds to your pharmacy`;

    await smsService.SMS.send({
      to: process.env.TO_PHONE,
      message: smsMessage,
      from: 'patamed'
    });

    console.log('SMS sent successfully');

    res.status(200).json({
      status: 200,
      message: 'SMS sent successfully'
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      status: 500,
      message: 'Error sending SMS',
    });
  }
};

exports.update = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    prescription.processed = !prescription.processed;

    prescription.save();

    return res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating prescription",
    });
  }
};

exports.getById = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);

    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "prescription not found",
      });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 139 ~ exports.getById= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error fetching prescription",
    });
  }
};

exports.delete = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    await Prescription.deleteOne({ _id: prescriptionId });

    res
      .status(200)
      .json({ code: 200, message: "Prescription deleted successfully." });
  } catch (error) {
    console.log(
      "🚀 ~ file: product.js ~ line 195 ~ exports.delete ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error deleting prescription",
    });
  }
};

exports.processOrder = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const { shopId, products, patientId, diagnosis, staffId, discount, bill } =
      req.body;

    if (!shopId || !products || !patientId || !staffId) {
      return res.status(400).json({
        code: 400,
        message: "Missing required fields",
      });
    }

    if (discount && !discount?.type && discount?.value) {
      return res.status(400).json({
        code: 400,
        message: "Invalid discount",
      });
    }

    if (bill && !bill?.received && bill?.change) {
      return res.status(400).json({
        code: 400,
        message: "Invalid bill",
      });
    }

    if (products.length < 1) {
      return res.status(400).json({
        code: 400,
        message: "At least one product required for a sale",
      });
    }

    const shop = await Shop.findById(shopId).populate("staff");
    if (!shop) {
      return res.status(400).json({
        code: 400,
        message: "Shop not found",
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({
        code: 400,
        message: "Patient not found",
      });
    }

    const shopStaff = shop.staff.find(
      (item) => item.member.toString() === staffId.toString()
    );
    if (!shopStaff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({
        code: 400,
        message: "Staff not found",
      });
    }

    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    prescription.updateOrderStatus("review");
    prescription.quoteTime = new Date()
    prescription.quote(
      bill,
      bill?.totalCost,
      discount?.type,
      discount?.value,
      diagnosis,
      staff
    );
    prescription.getProducts(products);

    prescription.save();

    onPrescriptionQuoted(patientId)

    const patientPrescriptionMessage = `Hello ${prescription.patient.firstName || "Customer"},\n\n` +
      `Your prescription has been quoted.\n` +
      `Please click on the Prescription tab on your order portal to confirm and enable the pharmacy to fulfill your order.\n` +
      `Confirm your order here: https://www.afyabook.com/Orders\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: prescription.patient.phoneNumber,
      message: patientPrescriptionMessage,
      from: 'Afyabook',
    });



    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: prescription.patient.email,
      subject: "Review Order",
      html: `
        <h3>Hello ${prescription.patient.firstName || ""},</h3>
        <p>Your prescription for has been quoted</p>
        <p>Click on the Prescription tab on your order portal to confirm, and enable the pharmacy to fulfill your order</p>
        <strong><a href="https://www.afyabook.com/Orders">Confirm Order</a></strong>`,
    };

    await emailService.sendMail(mail);

    return res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating prescription",
    });
  }
};

exports.processOrderCancel = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const { staffId } = req.body;
    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    prescription.updateOrderStatus("cancelled");
    prescription.processed = true;
    prescription.staff = staffId;
    prescription.cancellationTime = new Date()

    prescription.save();

    const shop = await Shop.findById(prescription.shop._id).populate("staff");

    const smsCancelPrescription = `Hello ${prescription.patient.firstName || "Customer"},\n\n` +
      `Your prescription has been cancelled.\n` +
      `You can re-order your prescription here: https://www.afyabook.com/Orders\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: prescription.patient.phoneNumber,
      message: smsCancelPrescription,
      from: 'Afyabook',
    });



    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: prescription.patient.email,
      subject: "Order Cancelled",
      html: `
        <h3>Hello ${prescription.patient.firstName || ""},</h3>
        <p>Your prescription has been cancelled</p>
        <strong><a href="https://www.afyabook.com/Orders">Re-Order</a></strong>`,
    };

    await emailService.sendMail(mail);

    onPrescriptionCancel(prescription.patient._id.toString())


    const targetSocket = userSockets.get(prescription.patient._id.toString());

    if (targetSocket) {
      targetSocket.emit("prescriptionCancelled");
    }

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onPrescriptionCancelPos(personId)

      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("prescription cancelled");
      }
    });

    return res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating prescription",
    });
  }
};


exports.processOrderReceived = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    prescription.updateOrderStatus("received");
    prescription.receiveTime = new Date()

    prescription.save();

    const smsDeliverPrescription = `Hello ${prescription.patient.firstName || "Customer"},\n\n` +
      `Your prescription has been delivered.\n` +
      `Check out our offers here: https://www.afyabook.com/pharmacy\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: prescription.patient.phoneNumber,
      message: smsDeliverPrescription,
      from: 'Afyabook',
    });


    const mail = {
      from: `Afyabook <no-reply@afyabook.com>`,
      to: prescription.patient.email,
      subject: "Order Received",
      html: `
        <h3>Hello ${prescription.patient.firstName || ""},</h3>
        <p>Your prescription has been delivered</p>
        <strong><a href="https://www.afyabook.com/pharmacy">See Offers</a></strong>`,
    };

    await emailService.sendMail(mail);

    const shop = await Shop.findById(prescription.shop._id).populate("staff");

    const baseUrl = process.env.POS_CLIENT_URL;

    const shopEmail = shop?.contact?.email || "";

    const adminEmail = process.env.ADMINEMAIL;

    const smsShopMsg = `Hello ${shop.name || "Team"},\n\n` +
      `${prescription.patient.firstName || "Customer"} has received the ordered items.\n` +
      `View prescriptions here: ${baseUrl}\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: shop.contact.phoneNumber,
      message: smsShopMsg,
      from: 'Afyabook',
    });

    // Send the SMS
    await smsService.SMS.send({
      to: process.env.ADMINPHONENUMBER,
      message: smsShopMsg,
      from: 'Afyabook',
    });




    if (shopEmail) {
      const data = {
        from: '"Afyabook" <no-reply@afyabook.com>',
        to: shopEmail,
        subject: "Order Received",
        html: `
          <h3>Hello ${shop.name || ""} team,</h3>
          <p>${prescription.patient.firstName || ""} has received the ordered items</p>
          <strong><a href="${baseUrl}">View Prescriptions</a></strong>`,
      };

      await emailService.sendMail(data);
    }

    const dataAdmin = {
      from: '"Afyabook" <no-reply@afyabook.com>',
      to: adminEmail,
      subject: "Order Received",
      html: `
          <h3>Hello ${shop.name || ""} team,</h3>
          <p>${prescription.patient.firstName || ""} has received the ordered items</p>
          <strong><a href="${baseUrl}">View Prescriptions</a></strong>`,
    };

    await emailService.sendMail(dataAdmin);

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onPrescriptionReceived(personId)

      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("prescriptionReceived");
      }
    });

    return res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating prescription",
    });
  }
};

exports.processOrderConfirm = async (req, res, next) => {
  const prescriptionId = req.params.prescriptionId;

  try {
    const prescription = await Prescription.findById(prescriptionId).populate([
      "patient",
      "shop",
      "staff"
    ]);
    if (!prescription) {
      return res.status(400).json({
        code: 400,
        message: "Prescription not found",
      });
    }

    prescription.updateOrderStatus("confirmed");
    prescription.confirmTime = new Date()

    prescription.save();

    const baseUrl = process.env.POS_CLIENT_URL;

    const shop = await Shop.findById(prescription.shop._id).populate("staff");

    const smsConfirmShopMsg = `Hello ${prescription.shop.name || "Team"},\n\n` +
      `The prescription has been confirmed for purchase by ${prescription.patient.firstName || "Customer"}.\n` +
      `View the prescription here: ${baseUrl}\n\n` +
      `Thank you,\nAfyabook`;

    // Send the SMS
    await smsService.SMS.send({
      to: shop.contact.phoneNumber,
      message: smsConfirmShopMsg,
      from: 'Afyabook',
    });



    const data = {
      from: '"Afyabook" <no-reply@afyabook.com>',
      to: shop.contact.email,
      subject: "Prescription confirmed",
      html: `
        <h3>Hello ${prescription.shop.name || ""} team,</h3>
        <p>The prescription has been confirmed for purchase by ${prescription.patient.firstName || ""
        }</p>
        <strong><a href="${baseUrl}">View Prescription</a></strong>`,
    };

    await emailService.sendMail(data);

    shop.staff.forEach(async (person) => {
      const personId = person.member.toString();
      onPrescriptionConfirmed(personId)

      const targetSocket = userSockets.get(personId);

      if (targetSocket) {
        targetSocket.emit("prescriptionConfirmed");
      }
    });

    return res.status(200).json(prescription);
  } catch (error) {
    console.log(
      "🚀 ~ file: prescription.js ~ line 103 ~ exports.update= ~ error",
      error
    );
    res.status(500).json({
      code: 500,
      message: "Error updating prescription",
    });
  }
};

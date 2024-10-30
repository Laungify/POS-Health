const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StaffSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    password: { type: String },
    specialty: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    loggedInCount: { type: Number, default: 0 },
    about: { type: String },
    profileImage: { type: String },
    officeLocation: {
      county: { type: String },
      street: { type: String },
      building: { type: String },
    },
    languages: [{ type: String }],
    registrationNumber: { type: String },
    education: [
      {
        institution: { type: String },
        qualification: { type: String },
      },
    ],
    availability: [
      {
        range: {
          start: { type: Date },
          end: { type: Date },
        },

        schedule: [
          {
            dayOfWeek: {
              type: String,
              enum: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            },
            hours: [{ type: String }],
          },
        ],
      },
    ],
    shops: [
      {
        _id: false,
        shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
        roles: [
          {
            type: String,
            enum: ["admin", "pharmacy", "billing", "doctor"],
          },
        ],
        owner: { type: Boolean, default: false },
        showStaff: { type: Boolean, default: true },
      },
    ],
    company: { type: Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true }
);

// Virtual for staff's full name
StaffSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

StaffSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
  },
});

const Staff = mongoose.model("Staff", StaffSchema, "staff");

module.exports = Staff;

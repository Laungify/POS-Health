const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsletterRegistrationSchema = new Schema(
    {
        email: { type: String, required: true },
        promotions: { type: Boolean, default: false, required: false },
    },
    { timestamps: true }
);

NewsletterRegistrationSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

const NewsletterRegistration = mongoose.model(
    "NewsletterRegistration",
    NewsletterRegistrationSchema,
    "newsletter_registrations"
);

module.exports = NewsletterRegistration;

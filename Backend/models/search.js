const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchSchema = new Schema(
    {
        productName: { type: String },
        phoneNumber: { type: String },
        // user: {
        //     firstName: { type: String },
        //     lastName: { type: String },
        //     email: { type: String },
        //     phoneNumber: { type: String },
        // },
    },
    { timestamps: true }
);

SearchSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

const Search = mongoose.model("Search", SearchSchema);

module.exports = Search;

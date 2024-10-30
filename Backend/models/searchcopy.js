const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchSchema = new Schema(
    {
        productSearch: { type: String },

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

const Searchcopy = mongoose.model("Searchcopy", SearchSchema);

module.exports = Searchcopy;

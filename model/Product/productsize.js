const mongoose = require("mongoose");

const productSizeSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    size: {
        type: String,
    },
    sizetype: {
        type: String,
    },
    quantity: {
        type: Number,
    },
},{
    timestamps: true,
});

module.exports = mongoose.model("productsize", productSizeSchema)
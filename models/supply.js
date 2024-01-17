const mongoose = require("mongoose");

const SupplySchema = mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier"
        },
        image: {
            type: String
        },
        reference: {
            type: String
        },
        date: {
            type: Date
        },
        remarks: {
            type: String
        },
        price: {
            type: Number
        }
    },
    {
        timestamps: {
            createdAt: true
        }
    }
);

module.exports = mongoose.model("Supply", SupplySchema);
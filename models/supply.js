const mongoose = require("mongoose");

const SupplySchema = mongoose.Schema(
    {
        supplier: {
            type: String,
        },
        image: {
            type: String
        },
        price: {
            type: Number
        },
        reference: {
            type: String
        },
        date: {
            type: Date
        }
    },
    {
        timestamps: {
            createdAt: true
        }
    }
);

module.exports = mongoose.model("Supply", SupplySchema);
const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stationery"
    },
    quantity: {
        type: Number
    },
    type: {
        type: String,
    },
    remarks: {
        type: String
    },
    reference: {
        demand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Demand",
        },
        supply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supply"
        },
    }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
    item: {
        name: {
            type: String
        },
        category: {
            type: String
        }
    },
    quantity: {
        type: Number
    },
    type: {
        type: String,
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
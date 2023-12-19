const mongoose = require("mongoose");

const DemandSchema = mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },
        image: {
            type: String
        },
        reference: {
            type: String
        }
    },
    {
        timestamps: {
            createdAt: true
        }
    }
);

module.exports = mongoose.model("Demand", DemandSchema);
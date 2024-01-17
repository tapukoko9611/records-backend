const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String
    },
    organization: {
        type: String
    },
    identity: {
        type: String
    }
});

module.exports = mongoose.model("Supplier", SupplierSchema);

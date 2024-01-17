const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String
    },
    designation: {
        type: String
    },
    identity: {
        type: String
    }
});

module.exports = mongoose.model("Employee", EmployeeSchema);

const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String
    },
    designation: {
        section: {
            type: String
        },
        number: {
            type: String
        }
    }
});

module.exports = mongoose.model("Employee", EmployeeSchema);

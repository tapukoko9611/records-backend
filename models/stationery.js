const mongoose = require("mongoose");

const StationerySchema = mongoose.Schema({
    name: {
        type: String
    },
    quantity: {
        type: Number
    },
    image: {
        type: String
    }
});

module.exports = mongoose.model("Stationery", StationerySchema);

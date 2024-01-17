const mongoose = require("mongoose");

const StationerySchema = mongoose.Schema({
    // item: {
    //     name: {
    //         type: String
    //     },
    //     category: {
    //         type: String
    //     }
    // },
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

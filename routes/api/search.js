const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Stationery = require("../../models/stationery"); 123


router.get("/employee/:emp", async (req, res) => {
    const search = await Employee.find({
        designation: {$regex: '.*' + emp.trim().toUppercase() + '.*'}
    });
    return search;
});

router.get("/stationery/:item", async (req, res) => {
    const search = await Stationery.find({
        name: {$regex: '.*' + item.trim().toUppercase() + '.*'}
    });
    return search;
});


module.exports = router;
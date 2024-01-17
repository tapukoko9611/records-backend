const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Stationery = require("../../models/stationery"); 123


router.get("/employee/:emp", async (req, res) => {
    const search = await Employee.find({
        "$or": [
            {
                "employee.designation": {$regex: '.*' + emp + '.*'}
            },
            {
                "employee.name": {$regex: '.*' + emp + '.*'}
            }
        ]
    });
    return search;
});

router.get("/stationery/:item", async (req, res) => {
    const search = await Stationery.find({
        "$or": [
            {
                "item.name": {$regex: '.*' + item + '.*'}
            },
            {
                "item.category": {$regex: '.*' + item + '.*'}
            }
        ]
    });
    return search;
});


module.exports = router;
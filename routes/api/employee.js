const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");

const searchEmployee = async ({section, number}) => {
    const search = await Employee.findOne({
        "$and": [
            {
                "designation.section": section
            },
            {
                "designation.number": number
            }
        ]
    });
    return search;
};

router.post("/add", async (req, res) => {
    try {
        const { name, designation } = req.body;
        name = name.toUpperCase();
        var fields = designation.trim().split(' ');
        if(name.length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee name' });
        }
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee designation' });
        }

        var section = fields[0].toUpperCase();
        var number = `${parseInt(fields[1])}`;
        var search = await searchEmployee({section, number});
        if(search) {
            console.log("An employee with that credential already exists");
            return res
                .status(400)
                .json({ error: 'An employee with that credential already exists' });
        }

        const employee = new Employee({
            name, 
            designation: {
                section,
                number
            }
        });
        registeredEmployee = await employee.save();
        res.status(200).json({
            name: registeredEmployee.name,
            designation: registeredEmployee.designation,
            id: `${section} ${number}`
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: "your request could not be processed at the time. Please try again."
        });
    }
});

router.delete("/remove", async (req, res) => {
    try {
        const { designation } = req.body;
        var fields = designation.trim().split(' ');
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee designation' });
        }

        var section = fields[0].toUpperCase();
        var number = `${parseInt(fields[1])}`;
        var search = await searchEmployee({section, number});
        if(!search) {
            console.log("Employee with that credential does not exist");
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        Employee
            .findByIdAndDelete(search._id)
            .then(() => res.status(200).json({"msg": "successfully deleted employee"}))
            .catch(err => console.log(err));
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: "your request could not be processed at the time. Please try again."
        });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { name, designation } = req.body;
        name = name.toUpperCase();
        var fields = designation.trim().split(' ');
        if(name.length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee name' });
        }
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee designation' });
        }

        var section = fields[0].toUpperCase();
        var number = `${parseInt(fields[1])}`;
        var search = await searchEmployee({section, number});
        if(!search) {
            console.log("Employee with that credential does not exist");
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        Employee
            .findByIdAndUpdate(search._id, {name: name})
            .then(() => res.status(200).json({
                "msg": "successfully updated employee",
                name: name,
                designation: search.designation,
                id: `${section} ${number}`
            }))
            .catch(err => console.log(err));
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: "your request could not be processed at the time. Please try again."
        });
    }
});

module.exports = router;
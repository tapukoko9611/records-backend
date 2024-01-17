const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");

const searchEmployee = async ({designation}) => {
    const search = await Employee.findOne({designation: designation.trim().toUpperCase()});
    return search;
};

router.post("/add", async (req, res) => {
    try {
        const { name, designation, identity } = req.body;

        if(name.trim().length==0 || designation.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid details' });
        }

        var search = await searchEmployee({designation});
        if(search) {
            return res
                .status(400)
                .json({ error: 'An employee with that credential already exists' });
        }

        const employee = new Employee({
            name: name.trim().toUpperCase(), 
            designation: designation.trim().toUpperCase(),
            identity
        });
        registeredEmployee = await employee.save();
        res.status(200).json({
            msg: "Successfully added an employee",
            name: registeredEmployee.name,
            designation: registeredEmployee.designation,
            identity: registeredEmployee.identity
        });

    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.delete("/delete", async (req, res) => {
    try {
        const { designation } = req.body;

        if(designation.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid details' });
        }

        var search = await searchEmployee({designation});
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        Employee
            .findByIdAndDelete(search._id)
            .then(() => res.status(200).json({"msg": "successfully deleted employee"}))
            .catch(err => console.log(err));
    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { name, designation, identity } = req.body;

        if(name.trim().length==0 || designation.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid employee details' });
        }

        var search = await searchEmployee({designation});
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        Employee
            .findByIdAndUpdate(
                search._id, 
                {name: name.trim().toUpperCase(), identity: identity})
            .then(() => res.status(200).json({
                "msg": "successfully updated employee",
                name: name,
                designation: search.designation,
                identity: search.identity
            }))
            .catch(err => console.log(err));
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

module.exports = router;
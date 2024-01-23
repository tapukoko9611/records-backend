const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Demand = require("../../models/demand");
const Transaction = require("../../models/transaction");
const Stationery = require("../../models/stationery");

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
            _id: registeredEmployee._id,
            name: registeredEmployee.name,
            designation: registeredEmployee.designation,
            identity: registeredEmployee.identity,
            count: [0, 0, 0]
        });

    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update:id", async (req, res) => {
    try {
        const { name, designation, identity } = req.body;

        if(name.trim().length==0 || designation.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid employee details' });
        }

        var search = await Employee.findById(id);
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        var searchDesignation = await searchEmployee({designation});
        if(searchDesignation._id != search._id) {
            return res
                .status(400)
                .json({ error: 'Employee with that designation already exists' });
        }


        Employee
            .findByIdAndUpdate(
                id, 
                {name: name.trim().toUpperCase(), identity: identity, designation: designation})
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

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.body;

        var employee = await Employee.findById(id);
        if(!employee) {
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        var demands = await Demand.find({employee: employee});
        for(let i=0; i<demands.length; i++) {
            var demand = demands[i];
            var transactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]});
            for (let j=0; j<transactions.length; j++) {
                var transaction = transactions[j];
                await Stationery
                    .findByIdAndUpdate(
                        transaction.item, 
                        {quantity: quantity-transaction.quantity})
                    .catch(err => console.log(err));
                await Transaction.findByIdAndDelete(transaction._id);
            }
            await Demand.findByIdAndDelete(demand._id);
        }
 
        await Employee
            .findByIdAndDelete(id)
            .then(() => res.status(200).json({"msg": "successfully deleted employee"}))
            .catch(err => console.log(err));
    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

module.exports = router;
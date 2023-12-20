const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Stationery = require("../../models/stationery");
const Demand = require("../../models/demand");
const Supply = require("../../models/supply");
const Transaction = require("../../models/transaction");

const searchStationery = async ({name, category}) => {
    const search = await Stationery.findOne({
        "$and": [
            {
                "item.name": name
            },
            {
                "item.category": category
            }
        ]
    });
    return search;
};

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

const handleTransaction = async ({element, type, reference}) => {
    // try {
        // list.forEach(async element => {
            // console.log(element);
            const {item, quantity} = element;
            // console.log(item, quantity);
            var fields = item.trim().split(' ');
            if(quantity==0) {
                throw new Error("You must enter a valid quantity");
            }
            if(fields.length<2) {
                throw new Error("You must enter a valid item");
            }

            var name = fields[0].trim().toUpperCase();
            var category = fields[1].trim().toUpperCase();
            var search = await searchStationery({name, category});
            if(!search) {
                if(type==="DEMAND") return("Item does not exist");
                if(type==="SUPPLY") {
                    const stationery = new Stationery({
                        item: {
                            name,
                            category
                        },
                        quantity: 0
                    });
                    stationery
                        .save()
                        .then(() => console.log("New stationary item created"))
                        .catch(err => console.log(err));
                    search = stationery;
                }
            }
            
            if(search.quantity+quantity<0) {
                return(`Not sufficient quantity. Available: ${search.quantity}`);
            }

            Stationery
                .findByIdAndUpdate(search._id, {quantity: search.quantity+quantity})
                .then(async () => {
                    const transaction = new Transaction({
                        item: {
                            name,
                            category
                        },
                        quantity: quantity,
                        type: type,
                        reference: reference
                    });
                    await 
                        transaction
                            .save()
                            .then(() => console.log("Successful transaction"))
                            .catch(err => console.log(`err at transaction: ${err}`));
                })
                .catch(err => console.log(`err at stationery: ${err}`));

            return "SUCCESSFUL";
        // })
        // .catch(err => {
        //     console.log("ffff");
        //     console.log(err); });
    // } catch (error) {
    //     return error;
    // }
};

router.post("/demand", async (req, res) => {
    try {
        const { designation, reference, list, image, date } = req.body;

        var fields = designation.trim().split(' ');
        var section = fields[0].toUpperCase();
        var number = `${parseInt(fields[1])}`;
        var emp = await searchEmployee({section, number});
        if(!emp) {
            console.log("Employee with that credential does not exist");
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        const demand = new Demand({
            employee: emp._id,
            image: image,
            reference: reference,
            date: date===""? Date.now(): date
        });
        registerDemand = await demand.save();

        const ref = {
            demand: registerDemand._id,
            supply: null
        }
        type = "DEMAND";

        for(element of list) {
            var result = await handleTransaction({element, type, reference: ref});
            if (result !== "SUCCESSFUL") {
                throw new Error(result);
            } 
        }
        res.status(200).json({...registerDemand._doc, "msg": "Successful demand transaction"});

        // const ret = await handleTransactions({list, type, reference: ref});
        // console.log(ret);
        // if (ret===1) res.status(200).json({...registerDemand._doc, "msg": "Successful demand transaction"});
        // else res.status(400).json({"msg": ret});

        // handleTransactions({list, type, reference: ref})
        //     .then(() => res.status(200).json({...registerDemand._doc, "msg": "Successful demand transaction"}))
        //     .catch(err => res.status(400).json({"msg": err}));

        // try {
        //     await handleTransactions({list, type, reference: ref});
        //     res.status(200).json({...registerDemand._doc, "msg": "Successful demand transaction"});
        // } catch (err) {
        //     res.status(400).json({"msg": err});
        // }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again. error: ${error}`
        });
    }
});

router.post("/supply", async (req, res) => {
    try {
        const { supplier, reference, list, image, price, date } = req.body;

        const supply = new Supply({
            supplier: supplier,
            image: image,
            price: price,
            reference: reference,
            date: date===""? Date.now(): date
        });
        registerSupply = await supply.save();

        const ref = {
            demand: null,
            supply: registerSupply._id
        }
        type = "SUPPLY";

        for(element of list) {
            var result = await handleTransaction({element, type, reference: ref});
            if (result !== "SUCCESSFUL") {
                throw new Error(result);
            } 
        }
        res.status(200).json({...registerSupply._doc, "msg": "Successful supply transaction"});

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again. error: ${error}`
        });
    }
});

module.exports = router;
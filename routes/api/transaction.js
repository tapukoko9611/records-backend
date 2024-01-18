const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Supplier = require("../../models/supplier");
const Stationery = require("../../models/stationery");
const Demand = require("../../models/demand");
const Supply = require("../../models/supply");
const Transaction = require("../../models/transaction");

const searchStationery = async ({name}) => {
    const search = await Stationery.findOne({name: name.trim().toUpperCase()});
    return search;
};

const searchEmployee = async ({designation}) => {
    const search = await Employee.findOne({designation: designation.trim().toUpperCase()});
    return search;
};

const searchSupplier = async ({organization}) => {
    const search = await Supplier.findOne({organization: organization.trim().toUpperCase()});
    return search;
};

const handleTransaction = async ({item, type, reference}) => {
    const {name, quantity, remarks} = item;
    
    if(quantity==0) {
        throw new Error("You must enter a valid quantity");
    }
    if(name.trim().length==0) {
        throw new Error("You must enter a valid item");
    }

    var search = await searchStationery({name});
    if(!search) {
        if(type==="DEMAND") return("Item does not exist");
        if(type==="SUPPLY") {
            const stationery = new Stationery({
                name: name.trim().toUpperCase(),
                quantity: 0
            });
            await stationery
                .save()
                // .then(() => console.log("New stationary item created"))
                .catch(err => console.log(err));
            search = stationery;
        }
    }
    
    if(search.quantity+quantity<0) {
        return(`Not sufficient quantity. Available: ${search.quantity}`);
    }

    Stationery
        .findByIdAndUpdate(
            search._id, 
            {quantity: search.quantity+quantity})
        .then(async () => {
            const transaction = new Transaction({
                item: search,
                quantity: quantity,
                type: type,
                reference: reference,
                remarks: remarks
            });
            await transaction
                .save()
                // .then(() => console.log("Successful transaction"))
                .catch(err => console.log(`err at transaction: ${err}`));
        })
        .catch(err => console.log(`err at stationery: ${err}`));

    return "SUCCESSFUL";
};

router.post("/demand", async (req, res) => {
    try {
        const { designation, reference, list, image, date, remarks } = req.body;

        var emp = await searchEmployee({designation});
        if(!emp) {
            console.log("Employee with that credential does not exist");
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        const demand = new Demand({
            employee: emp,
            image: image,
            reference: reference,
            date: date && date!=""? date: Date.now(),
            remarks: remarks
        });
        registerDemand = await demand.save();

        const ref = {
            demand: registerDemand,
            supply: null
        }
        type = "DEMAND";

        for(item of list) {
            var result = await handleTransaction({item, type, reference: ref});
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
        const { organization, reference, list, image, price, date, remarks } = req.body;

        var supplier = await searchSupplier({organization});
        if(!supplier) {
            sup = new Supplier({
                name: organization.trim().toUpperCase(),
                organization: organization.trim().toUpperCase()
            });
            var registerSupplier = await sup.save();
            supplier = registerSupplier;
        }

        const supply = new Supply({
            supplier: supplier,
            image: image,
            price: price,
            reference: reference,
            date: date && date!=""? date: Date.now(),
            remarks: remarks
        });
        var registerSupply = await supply.save();

        const ref = {
            demand: null,
            supply: registerSupply
        }
        type = "SUPPLY";

        for(item of list) {
            var result = await handleTransaction({item, type, reference: ref});
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
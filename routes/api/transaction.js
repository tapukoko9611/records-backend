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
    const search = await Employee.findOne({designation: designation.trim().toUpperCase()}).lean();
    return search;
};

const searchSupplier = async ({organization}) => {
    const search = await Supplier.findOne({organization: organization.trim().toUpperCase()}).lean();
    return search;
};

const handleTransaction = async ({item, type, reference}) => {
    const {name, quantity, remarks} = item;
    
    if(name.trim().length==0) {
        return({"message": "Enter a valid item name"});;
    }

    var search = await searchStationery({name});
    if(!search) {
        if(type==="DEMAND") return({"message": "Item does not exist"});
        if(type==="SUPPLY") {
            const stationery = new Stationery({
                name: name.trim().toUpperCase(),
                quantity: 0,
                image: "https://imgs.search.brave.com/DqnON25chCTusI25nlZFXJdFdDPIr29ymmdP-NvPRGQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFDMkZ4V24tOUwu/anBn"
            });
            await stationery
                .save()
                // .then(() => console.log("New stationary item created"))
                .catch(err => console.log(err));
            search = stationery;
        }
    }

    // Stationery
    //     .findByIdAndUpdate(
    //         search._id, 
    //         {quantity: search.quantity+quantity})
    //     .then(async () => {
    //         const transaction = new Transaction({
    //             item: search,
    //             quantity: quantity,
    //             type: type,
    //             reference: reference,
    //             remarks: remarks
    //         });
    //         await transaction
    //             .save()
    //             // .then(() => console.log("Successful transaction"))
    //             .catch(err => console.log(`err at transaction: ${err}`));
    //     })
    //     .catch(err => console.log(`err at stationery: ${err}`));
    // await Stationery.findByIdAndUpdate(search._id, {quantity: search.quantity+quantity});
    search.quantity = search.quantity+quantity;
    await search.save(); // if search = search._doc, this method would not work
    var transaction = new Transaction({item: search, quantity: quantity, type: type, reference: reference, remarks: remarks});
    await transaction.save();
    return {"message": "SUCCESSFUL", "transaction": {...transaction._doc, item: search._doc, reference: {supply: transaction._doc.reference.supply? transaction._doc.reference.supply._id: null, demand: transaction._doc.reference.demand? transaction._doc.reference.demand._id: null}}};
};

router.post("/demand", async (req, res) => {
    try {
        const { employee, reference, list, image, date, remarks } = req.body;

        var emp = await searchEmployee({designation: employee});
        if(!emp) {
            return res
                .status(400)
                .json({ error: 'Employee with that credential does not exist' });
        }

        const demand = new Demand({
            employee: emp,
            image: image,
            reference: reference,
            date: date && date!=""? Date.parse(date): Date.now(),
            remarks: remarks
        });
        registerDemand = await demand.save();

        const ref = {
            demand: registerDemand,
            supply: null
        }
        type = "DEMAND";
        var transactions = [];

        for(item of list) {
            var result = await handleTransaction({item, type, reference: ref});
            if (result["message"] !== "SUCCESSFUL") {
                throw new Error(result["message"]);
            } else {
                transactions.push(result["transaction"]);
            }
        }
        res.status(200).json({...registerDemand._doc, employee: emp, "transactions": transactions, "msg": "Successful demand transaction"});

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
        const { supplier, reference, list, image, price, date, remarks } = req.body;

        var supplierInfo = await searchSupplier({organization: supplier});
        if(!supplierInfo) {
            sup = new Supplier({
                name: supplier.trim().toUpperCase(),
                organization: supplier.trim().toUpperCase()
            });
            var registerSupplier = await sup.save();
            supplierInfo = registerSupplier;
        }

        const supply = new Supply({
            supplier: supplierInfo,
            image: image,
            price: price,
            reference: reference,
            date: date && date!=""? new Date(date): Date.now(),
            remarks: remarks
        });
        var registerSupply = await supply.save();

        const ref = {
            demand: null,
            supply: registerSupply
        }
        type = "SUPPLY";

        var transactions = [];
        for(item of list) {
            var result = await handleTransaction({item, type, reference: ref});
            if (result["message"]!="SUCCESSFUL") {
                throw new Error(result["message"]);
            } 
            transactions.push(result["transaction"]);
        }
        res.status(200).json({...registerSupply._doc, supplier: supplierInfo, "transactions": transactions,  "msg": "Successful supply transaction"});

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again. error: ${error}`
        });
    }
});

router.delete("/update/:id&:type", async (req, res) => {
    const {id, type} = req.params;
    try {
        if (type=="DEMAND") {
            var demand = await Demand.findById(id);
            if (!demand) {
                return res.status(400).json({error: "Cannot find any demand with that id"});
            }
            var transactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]});
            for (let i=0; i<transactions.length; i++) {
                var transaction = transactions[i];
                await Stationery
                    .findByIdAndUpdate(
                        transaction.item, 
                        {quantity: quantity-transaction.quantity})
                    .catch(err => console.log(err));
                // await Transaction.findByIdAndDelete(transaction._id);
            }
            await Transaction.deleteMany({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]});
            await Demand.findByIdAndDelete(id);
        }
        else {
            var supply = await Supply.findById(id);
            if (!supply) {
                return res.status(400).json({error: "Cannot find any supply with that id"});
            }
            var transactions = await Transaction.find({"$and": [{"type": "SUPPLY"}, {"reference.supply": supply}]});
            for (let i=0; i<transactions.length; i++) {
                var transaction = transactions[i];
                await Stationery
                    .findByIdAndUpdate(
                        transaction.item, 
                        {quantity: quantity-transaction.quantity})
                    .catch(err => console.log(err));
                // await Transaction.findByIdAndDelete(transaction._id);
            }
            
            await Transaction.deleteMany({"$and": [{"type": "SUPPLY"}, {"reference.supply": demand}]});
            await Supply.findByIdAndDelete(id);
        }
        res.status(200).json({"msg": "Successfully deleted the transaction"});
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again. error: ${error}`
        });
    }
});

module.exports = router;
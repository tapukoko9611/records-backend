const express = require("express");
const router = express.Router();

const Supplier = require("../../models/supplier");
const Supply = require("../../models/supply");
const Transaction = require("../../models/transaction");
const Stationery = require("../../models/stationery");

const searchSupplier = async ({organization}) => {
    const search = await Supplier.findOne({organization: organization.trim().toUpperCase()});
    return search;
};

router.post("/add", async (req, res) => {
    try {
        const { name, organization, identity } = req.body;

        name = name.toUpperCase();
        if(name.trim().length==0 || organization.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid details' });
        }

        var search = await searchSupplier({organization});
        if(search) {
            return res
                .status(400)
                .json({ error: 'A Supplier with that credential already exists' });
        }

        const supplier = new Supplier({
            name: name.trim().toUpperCase(), 
            organization: organization.trim().toUpperCase(),
            identity
        });
        registeredSupplier = await supplier.save();
        res.status(200).json({
            msg: "Successfully added an Supplier",
            name: registeredSupplier.name,
            organization: registeredSupplier.organization,
            identity: registeredSupplier.identity
        });

    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update:id", async (req, res) => {
    try {
        const { name, organization, identity } = req.body;

        if(name.trim().length==0 || organization.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid employee details' });
        }

        var search = await Supplier.findById(id);
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Supplier with that credential does not exist' });
        }

        var searchOrganization = await searchEmployee({organization});
        if(searchOrganization._id != search._id) {
            return res
                .status(400)
                .json({ error: 'Supplier with that organization already exists' });
        }


        Supplier
            .findByIdAndUpdate(
                id, 
                {name: name.trim().toUpperCase(), identity: identity, organization: organization})
            .then(() => res.status(200).json({
                "msg": "successfully updated employee",
                name: name,
                organization: search.organization,
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

        var supplier = await Supplier.findById(id);
        if(!supplier) {
            return res
                .status(400)
                .json({ error: 'Supplier with that credential does not exist' });
        }

        var supplies = await Supply.find({supplier: supplier});
        for(let i=0; i<supplies.length; i++) {
            var supply = supplies[i];
            var transactions = await Transaction.find({"$and": [{"type": "SUPPLY"}, {"reference.supply": supply}]});
            for (let j=0; j<transactions.length; j++) {
                var transaction = transactions[j];
                await Stationery
                    .findByIdAndUpdate(
                        transaction.item, 
                        {quantity: quantity-transaction.quantity})
                    .catch(err => console.log(err));
                await Transaction.findByIdAndDelete(transaction._id);
            }
            await Supply.findByIdAndDelete(supply._id);
        }
 
        await Supplier
            .findByIdAndDelete(id)
            .then(() => res.status(200).json({"msg": "successfully deleted supplier"}))
            .catch(err => console.log(err));
    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

module.exports = router;
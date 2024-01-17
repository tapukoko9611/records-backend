const express = require("express");
const router = express.Router();

const Supplier = require("../../models/supplier");

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

router.delete("/delete", async (req, res) => {
    try {
        const { organization } = req.body;

        if(organization.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid details' });
        }

        var search = await searchSupplier({organization});
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Supplier with that credential does not exist' });
        }

        Supplier
            .findByIdAndDelete(search._id)
            .then(() => res.status(200).json({"msg": "successfully deleted Supplier"}))
            .catch(err => console.log(err));
    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { name, organization, identity } = req.body;

        name = name.toUpperCase();
        if(name.trim().length==0 || organization.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter valid Supplier details' });
        }

        var search = await searchSupplier({organization});
        if(!search) {
            return res
                .status(400)
                .json({ error: 'Supplier with that credential does not exist' });
        }

        Supplier
            .findByIdAndUpdate(
                search._id, 
                {name: name.trim().toUpperCase(), identity: identity})
            .then(() => res.status(200).json({
                "msg": "successfully updated Supplier",
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

module.exports = router;
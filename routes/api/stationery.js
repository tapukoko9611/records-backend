const express = require("express");
const router = express.Router();

const Stationery = require("../../models/stationery");

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

router.post("/add", async (req, res) => {
    try {
        const { item, quantity, image } = req.body;
        var fields = item.trim().split(' ');
        if(quantity==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid quantity' });
        }
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid item' });
        }

        var name = fields[0].trim().toUpperCase();
        var category = fields[1].trim().toUpperCase();
        var search = await searchStationery({name, category});
        if(search) {
            console.log("A stationary item already exists");
            return res
                .status(400)
                .json({ error: 'A stationary item already exists' });
        }

        const stationery = new Stationery({
            item: {
                name,
                category
            },
            quantity,
            image
        });
        registeredStationery = await stationery.save();
        res.status(200).json({
            msg: "successfully added stationery",
            item: registeredStationery.item,
            quantity: registeredStationery.quantity,
            image: image,
            id: `${name} ${category}`
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: "your request could not be processed at the time. Please try again."
        });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { item, quantity, image } = req.body;
        var fields = item.trim().split(' ');
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid item' });
        }

        var fields = item.trim().split(' ');
        if(quantity==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid quantity' });
        }
        if(fields.length<2) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid employee designation' });
        }

        var name = fields[0].trim().toUpperCase();
        var category = fields[1].trim().toUpperCase();
        var search = await searchStationery({name, category});
        if(!search) {
            console.log("Item does not exist");
            return res
                .status(400)
                .json({ error: `Item does not exist` });
        }
        if(search.quantity+quantity<0) {
            console.log("Not suffiecient quantity");
            return res
                .status(400)
                .json({ error: `Not sufficient quantity. Available: ${search.quantity}` });
        }

        Stationery
            .findByIdAndUpdate(search._id, {quantity: search.quantity+quantity, image: image})
            .then(() => res.status(200).json({
                msg: "successfully updated stationery",
                item: search.item,
                quantity: search.quantity+quantity,
                id: `${name} ${category}`
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
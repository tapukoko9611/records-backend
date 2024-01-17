const express = require("express");
const router = express.Router();

const Stationery = require("../../models/stationery");

const searchStationery = async ({name}) => {
    const search = await Stationery.findOne({name: name.trim().toUpperCase()});
    return search;
};

router.post("/add", async (req, res) => {
    try {
        const { name, quantity, image } = req.body;
        
        if(quantity==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid quantity' });
        }
        if(name.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid item name' });
        }

        var search = await searchStationery({name});
        if(search) {
            return res
                .status(400)
                .json({ error: 'A stationary item with this name already exists' });
        }

        const stationery = new Stationery({
            name: name.trim().toUpperCase(),
            quantity,
            image
        });
        registeredStationery = await stationery.save();
        res.status(200).json({
            msg: "successfully added a stationery item",
            name: registeredStationery.name,
            quantity: registeredStationery.quantity,
            image: image,
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update", async (req, res) => {
    try {
        const { name, quantity, image } = req.body;

        if(name.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid item name' });
        }
        if(quantity==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid quantity' });
        }

        var search = await searchStationery({name});
        if(!search) {
            return res
                .status(400)
                .json({ error: `Item does not exist` });
        }

        if(search.quantity+quantity<0) {
            return res
                .status(400)
                .json({ error: `Not sufficient quantity. Available: ${search.quantity}` });
        }

        Stationery
            .findByIdAndUpdate(
                search._id, 
                {quantity: search.quantity+quantity, image: image})
            .then(() => res.status(200).json({
                msg: "successfully updated stationery",
                name: search.name,
                quantity: search.quantity+quantity,
                image: image
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
const express = require("express");
const router = express.Router();

const Employee = require("../../models/employee");
const Demand = require("../../models/demand");
const Transaction = require("../../models/transaction");
const Stationery = require("../../models/stationery");

const searchStationery = async ({name}) => {
    const search = await Stationery.findOne({name: name.trim().toUpperCase()}).lean();
    return search;
};

router.post("/add", async (req, res) => {
    try {
        var { name, quantity, image } = req.body;

        if(typeof quantity == "string") {
            quantity = parseInt(quantity);
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
            image: image.trim().length==0? "https://imgs.search.brave.com/DqnON25chCTusI25nlZFXJdFdDPIr29ymmdP-NvPRGQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODFDMkZ4V24tOUwu/anBn": image,

        });
        registeredStationery = await stationery.save();
        res.status(200).json({
            _id: registeredStationery._id,
            msg: "successfully added a stationery item",
            name: registeredStationery.name,
            quantity: registeredStationery.quantity,
            image: image,
            demand: [0, 0, 0],
            supply: [quantity, quantity, quantity]
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

router.put("/update/:id", async (req, res) => {
    try {
        var { name, quantity, image } = req.body;
        const  {id} = req.params;

        if(typeof quantity == "string") {
            quantity = parseInt(quantity);
        }

        if(name.trim().length==0) {
            return res
                .status(400)
                .json({ error: 'You must enter a valid item name' });
        }

        var search = await Stationery.findById(id);
        if(!search) {
            return res
                .status(400)
                .json({ error: `Item does not exist` });
        }

        var searchName = await searchStationery({name});
        if(searchName._id != id) {
            return res
                .status(400)
                .json({ error: `Item with that name already exists` });
        }

        Stationery
            .findByIdAndUpdate(
                id, 
                {name: name, quantity: quantity, image: image})
            .then(() => res.status(200).json({
                msg: "successfully updated stationery",
                name: name,
                quantity: quantity,
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

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        var stationery = await Stationery.findById(id);
        if(!stationery) {
            return res
                .status(400)
                .json({ error: 'ITem with that credential does not exist' });
        }

        await Transaction.deleteMany({item: stationery});
 
        await Stationery
            .findByIdAndDelete(id)
            .then(() => res.status(200).json({"msg": "successfully deleted item"}))
            .catch(err => console.log(err));
    } catch (error) {
        res.status(400).json({
            error: `your request could not be processed at the time. Please try again: ${error}`
        });
    }
});

module.exports = router;
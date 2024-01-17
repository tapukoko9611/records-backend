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

// router.get("/employee/:designation", async(req, res) => {
//     // particular employee with all transactions of his, listed (with demand) wrt date
//     const {designation} = req.params;
//     var fields = designation.trim().split(' ');
//     var section = fields[0].toUpperCase();
//     var number = `${parseInt(fields[1])}`;
//     var employee = await searchEmployee({section, number});
//     if(!employee) {
//         console.log("Employee with that credential does not exist");
//         return res
//             .status(400)
//             .json({ error: 'Employee with that credential does not exist' });
//     }
//     try {
//         var demands = await Demand.find({employee: employee}).sort({date: -1}).select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});

//         for(var i=0; i<demands.length; i++) {
//             var transactions = await Transaction
//                                         .find({"$and": [{"type": "DEMAND"}, {"reference.demand": demands[i]}]})
//                                         .select({item: 1, quantity: 1})
//             console.log(transactions);
//             demands[i] = {...demands[i]._doc, list: transactions};
//             // console.log("--------------------------------------------------------------------------");
//             // console.log(demands[i]);
//         }
//         // demands.map(async element => {
//         //     var transactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": element}]});
//         //     console.log(transactions);
//         //     return {...element, list: transactions}
//         // });

//         res.status(200).json({...employee._doc, demands: demands});
//     } catch (err) {
//         res.status(400).json({"msg": err});
//     }
// });

router.get("/employee/:designation&:type", async(req, res) => {
    // particular employee with all transactions of his, listed (with demand) wrt date
    const {designation, type} = req.params;
    var fields = designation.trim().split(' ');
    var section = fields[0].toUpperCase();
    var number = `${parseInt(fields[1])}`;
    var employee = await searchEmployee({section, number});
    if(!employee) {
        console.log("Employee with that credential does not exist");
        return res
            .status(400)
            .json({ error: 'Employee with that credential does not exist' });
    }
    // res.status(200).json({designation: designation, type: type});
    if(type=="DATE_WISE") {
        try {
            var demands = await Demand.find({employee: employee}).sort({date: -1}).select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});

            for(var i=0; i<demands.length; i++) {
                var transactions = await Transaction
                                            .find({"$and": [{"type": "DEMAND"}, {"reference.demand": demands[i]}]})
                                            .select({item: 1, quantity: 1})
                console.log(transactions);
                demands[i] = {...demands[i]._doc, list: transactions};
                // console.log("--------------------------------------------------------------------------");
                // console.log(demands[i]);
            }
            // demands.map(async element => {
            //     var transactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": element}]});
            //     console.log(transactions);
            //     return {...element, list: transactions}
            // });

            res.status(200).json({...employee._doc, demands: demands});
        } catch (err) {
            res.status(400).json({"msg": err});
        }
    }
    else {
        try{
            var answer = {};
            // await Demand
            //     .find({employee: employee})
            //     .then((docs) => {
            //         console.log(docs);
            //     })
            answer = Demand
                .find({employee: employee})
                .then((demands) => {
                    var ans = {}
                    // console.log(demands);
                    demands.map(async (demand) => {
                        // console.log(ans);
                        // console.log("-----------------------------------------");
                        Transaction
                            .find({"reference.demand": demand})
                            .then((transactions) => {
                                // console.log(transactions);
                                transactions.map((transaction) => {
                                    var done=false;
                                    for (let i in ans) {
                                        if(i===`${transaction.item.name} ${transaction.item.category}`) {
                                            // ans[i] = [
                                            //     ...ans[i], {
                                            //     "quantity": transaction.quantity,
                                            //     "date": demand.date
                                            // }];
                                            console.log("changing");
                                            ans[i] = {
                                                quantity: ans[i].quantity+transaction.quantity,
                                                transactions: [
                                                    ...ans[i].transactions,
                                                    {
                                                        "quantity": transaction.quantity,
                                                        "date": demand.date
                                                    }
                                                ]
                                            }
                                            // console.log(ans);
                                            done=true;
                                        }
                                    }
                                    if(done===false) {
                                        console.log("adding");
                                        ans[`${transaction.item.name} ${transaction.item.category}`] = {
                                            quantity: transaction.quantity,
                                            transactions: [
                                                {
                                                    "quantity": transaction.quantity,
                                                    "date": demand.date
                                                }
                                            ]
                                        }
                                        // console.log(ans);
                                    }
                                    done=false;
                                });
                            });
                    });
                    console.log(ans);
                    return ans;
            });
            res.status(200).json({...employee._doc, demands: answer});
        } catch (err) {
            res.status(400).json({"msg": err});
        }
    }
});

router.get("/employee", async(req, res) => {
    // get list of all employees with each of them having their total no.of transactions (today, this week, this month, all time)
    try{
        var employees = await Employee.find();
        // console.log(employees);
        for(var i=0; i<employees.length; i++) {
            var demands = await Demand.find({employee: employees[i]._id}); 
            // console.log(demands)
            var today=0, week=0, month=0, alltime=0, curr= new Date();
            demands.map(demand => {
                today += demand.date.getDate()===curr.getDate()? 1: 0;
                month += demand.date.getMonth()===curr.getMonth()? 1: 0;
                alltime += 1;
            });
            employees[i] = {...employees[i]._doc, count: [today, week, month, alltime]};
        }
        res.status(200).json(employees);
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});

router.get("/stationery/:item", async(req, res) => {
    // particular stationery with all transactions of it listed (with supply and demand) wrt date
    const {item} = req.params;
    var fields = item.trim().split(' ');
    var name = fields[0].toUpperCase();
    var category = fields[1].toUpperCase();
    var stationery = await searchStationery({name, category});
    if(!stationery) {
        console.log("Stationery does not exist");
        return res
            .status(400)
            .json({ error: 'Stationery does not exist' });
    }
    try {
        var transactions = await Transaction.find({item: stationery.item});
        for(var i=0; i<transactions.length; i++) {
            if(transactions[i].type==="DEMAND") {
                var demand = await Demand.findById(transactions[i].reference.demand).populate("employee");
                transactions[i] = {...transactions[i]._doc, demands: demand};
            }
            else if(transactions.type==="SUPPLY") {
                var supply = await Supply.findById(transactions[i].reference.supply);//.select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});
                transactions[i] = {...transactions[i]._doc, supply: supply};
            }
        }

        res.status(200).json({...stationery._doc, transactions: transactions});
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});

router.get("/stationery", async(req, res) => {
    // get list of all stationery each of it having their total no.of transactions (seperate demand and supply) (today, this week, this month, all time)
    try{
        var stationery = await Stationery.find();
        // console.log(stationery);
        for(var i=0; i<stationery.length; i++) {
            var transactions = await Transaction.find({item: stationery[i].item}).populate("reference.demand reference.supply", "date");
            // console.log(transactions);
            var supply = [0, 0, 0, 0], demand = [0, 0, 0, 0], curr= new Date();
            transactions.map(transaction => {
                console.log(transaction);
                if (transaction.reference.demand !== null){
                    demand[0] += transaction.reference.demand.date.getDate()===curr.getDate()? transaction.quantity: 0;
                    demand[2] += transaction.reference.demand.date.getMonth()===curr.getMonth()? transaction.quantity: 0;
                    demand[3] += transaction.quantity;
                }
                else if (transaction.reference.supply !== null) {
                    supply[0] += transaction.reference.supply.date.getDate()===curr.getDate()? transaction.quantity: 0;
                    supply[2] += transaction.reference.supply.date.getMonth()===curr.getMonth()? transaction.quantity: 0;
                    supply[3] += transaction.quantity;
                }
            });
            stationery[i] = {...stationery[i]._doc, demand: demand, supply: supply};
        }
        res.status(200).json(stationery);
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});

router.get("/transaction/:transactionDetails", async(req, res) => {
    // get all supply or demand transactions (filled)
    const {transactionDetails} = req.params;
    var transactionDetails1 = transactionDetails.split('-');
    var transactionId=transactionDetails1[0], type=transactionDetails1[1];
    // console.log(transactionId, type);
    // var fields = item.trim().split(' ');
    // var name = fields[0].toUpperCase();
    // var category = fields[1].toUpperCase();
    // var stationery = await searchStationery({name, category});
    // if(!stationery) {
    //     console.log("Stationery does not exist");
    //     return res
    //         .status(400)
    //         .json({ error: 'Stationery does not exist' });
    // }
    try {
        var transaction = type=="DEMAND"? await Demand.findById(transactionId).populate("employee"): await Supply.findById(transactionId);
        // console.log(transaction);

        var transactions = await Transaction.find({"$and": [{"$or": [{"reference.demand": transaction._id}, {"reference.supply": transaction._id}]}, {"type": type}]});
        

        // for(var i=0; i<transactions.length; i++) {
        //     if(transactions[i].type==="DEMAND") {
        //         var demand = await Demand.findById(transactions[i].reference.demand).populate("employee");
        //         transactions[i] = {...transactions[i]._doc, demands: demand};
        //     }
        //     else if(transactions.type==="SUPPLY") {
        //         var supply = await Supply.findById(transactions[i].reference.supply);//.select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});
        //         transactions[i] = {...transactions[i]._doc, supply: supply};
        //     }
        // }

        res.status(200).json({...transaction._doc, list: transactions});
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});

router.get("/transaction", async(req, res) => {
    // get all supply and demand transactions (filled)
    try {
        var demand = await Demand.find().populate("employee");
        var supply = await Supply.find();
        // console.log(transaction);

        // var transactions = await Transaction.find({"$and": [{"$or": [{"reference.demand": transaction._id}, {"reference.supply": transaction._id}]}, {"type": type}]});
        res.status(200).json({supply: supply, demand: demand});
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});

module.exports = router;
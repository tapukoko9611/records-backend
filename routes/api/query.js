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

router.get("/employee/:designation&:type", async(req, res) => {
    // particular employee with all transactions of his, listed (with demand) wrt date
    const {designation, type} = req.params;

    var employee = await searchEmployee({designation});
    if(!employee) {
        console.log("Employee with that credential does not exist");
        return res
            .status(400)
            .json({ error: 'Employee with that credential does not exist' });
    }
    
    if(type=="DATE_WISE") {
        try {
            var demands = await Demand.find({employee: employee}).sort({date: -1}).select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});

            for(var i=0; i<demands.length; i++) {
                var transactions = 
                    await Transaction
                        .find({"$and": [{"type": "DEMAND"}, {"reference.demand": demands[i]}]})
                        .populate("item")
                        .select({item: 1, quantity: 1})
                // console.log(transactions);
                demands[i] = {...demands[i]._doc, list: transactions};
            }

            res.status(200).json({...employee._doc, demands: demands});
        } catch (err) {
            res.status(400).json({"msg": err});
        }
    }
    else if(type=="ITEM_WISE") {
        try{
            // var ans = {};
            // await Demand
            //     .find({employee: employee})
            //     .then((demands) => {
            //         demands.map(async (demand) => {
            //             console.log("ans");;
            //             await Transaction
            //                 .find({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]})
            //                 .then((transactions) => {
            //                     console.log(ans);
            //                     transactions.map(async (transaction) => {
            //                         var done=false;
            //                         var item = await Stationery.findById(transaction.item).select("name");
            //                         // console.log(item);
            //                         for (let i in ans) {
            //                             if(i===item.name) {
            //                                 ans[i] = {
            //                                     quantity: ans[i].quantity+transaction.quantity,
            //                                     transactions: [
            //                                         ...ans[i].transactions,
            //                                         {
            //                                             "quantity": transaction.quantity,
            //                                             "date": demand.date
            //                                         }
            //                                     ]
            //                                 }
            //                                 // console.log(ans);
            //                                 done=true;
            //                             }
            //                         }
            //                         if(done===false) {
            //                             // console.log("adding");
            //                             ans[item.name] = {
            //                                 quantity: transaction.quantity,
            //                                 transactions: [
            //                                     {
            //                                         "quantity": transaction.quantity,
            //                                         "date": demand.date
            //                                     }
            //                                 ]
            //                             }
            //                             // console.log(ans);
            //                         }
            //                         done=false;
            //                     });
            //                 });
            //         });
            //     // console.log(ans);
            // });

            var ans = {};

            var demands = await Demand.find({employee: employee});
            for(let i=0; i<demands.length; i++) {
                var demand = demands[i];
                var transactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]});
                for(let j=0; j<transactions.length; j++) {
                    var transaction = transactions[j];
                    var done = false;
                    var item = await Stationery.findById(transaction.item).select("name");
                    for (let k in ans) {
                        if(k===item.name) {
                            ans[k] = {
                                quantity: ans[k].quantity+transaction.quantity,
                                transactions: [
                                    ...ans[k].transactions,
                                    {
                                        "quantity": transaction.quantity,
                                        "remarks": transaction.remarks,
                                        "date": demand.date
                                    }
                                ]
                            }
                            // console.log(ans);
                            done=true;
                        }
                    }
                    if(done===false) {
                        // console.log("adding");
                        ans[item.name] = {
                            quantity: transaction.quantity,
                            transactions: [
                                {
                                    "quantity": transaction.quantity,
                                    "remarks": transaction.remarks,
                                    "date": demand.date
                                }
                            ]
                        }
                        // console.log(ans);
                    }
                    // done=false;
                }
            }

            res.status(200).json({...employee._doc, demands: ans});
        } catch (err) {
            console.log(err);
            res.status(400).json({"msg": err.message});
        }
    }
});

router.get("/employee", async(req, res) => {
    // get list of all employees with each of them having their total no.of transactions (today, this week, this month, all time)
    try{
        var employees = await Employee.find();
        // console.log(employees);
        for(var i=0; i<employees.length; i++) {
            var demands = await Demand.find({employee: employees[i]}); 
            // console.log(demands)
            var today=0, month=0, alltime=0, curr= new Date();
            demands.map(demand => {
                // console.log(demand);
                today += demand.date && demand.date.getDate()===curr.getDate()? 1: 0;
                month += demand.date && demand.date.getMonth()===curr.getMonth()? 1: 0;
                alltime += 1;
            });
            employees[i] = {...employees[i]._doc, count: [today, month, alltime]};
        }
        res.status(200).json(employees);
    } catch (err) {
        console.timeLog(err);
        res.status(400).json({"msg": err.message});
    }
});

router.get("/supplier", async(req, res) => {
    // get list of all employees with each of them having their total no.of transactions (today, this week, this month, all time)
    try{
        var suppliers = await Supplier.find();
        for(var i=0; i<suppliers.length; i++) {
            var supplies = await Supply.find({supplier: suppliers[i]}); 
            var today=0, month=0, alltime=0, curr= new Date();
            supplies.map(supply => {
                today += supply.date && supply.date.getDate()===curr.getDate()? 1: 0;
                month += supply.date && supply.date.getMonth()===curr.getMonth()? 1: 0;
                alltime += 1;
            });
            suppliers[i] = {...suppliers[i]._doc, count: [today, month, alltime]};
        }
        res.status(200).json(suppliers);
    } catch (err) {
        console.timeLog(err);
        res.status(400).json({"msg": err.message});
    }
});

router.get("/supplier/:organization&:type", async(req, res) => {
    // particular employee with all transactions of his, listed (with demand) wrt date
    const {organization, type} = req.params;

    var supplier = await searchSupplier({organization});
    if(!supplier) {
        return res
            .status(400)
            .json({ error: 'Supplier with that credential does not exist' });
    }
    
    if(type=="DATE_WISE") {
        try {
            var supplies = await Supply.find({supplier: supplier}).sort({date: -1}).select({updatedAt: 0, createdAt: 0, supplier: 0, __v: 0});

            for(var i=0; i<supplies.length; i++) {
                var transactions = 
                    await Transaction
                        .find({"$and": [{"type": "SUPPLY"}, {"reference.supply": supplies[i]}]})
                        .select({item: 1, quantity: 1})
                // console.log(transactions);
                supplies[i] = {...supplies[i]._doc, list: transactions};
            }

            res.status(200).json({...supplier._doc, supplies: supplies});
        } catch (err) {
            res.status(400).json({"msg": err});
        }
    }
    else if(type=="ITEM_WISE") {
        try{
            var ans = {};

            var supplies = await Supply.find({supplier: supplier});
            for(let i=0; i<supplies.length; i++) {
                var supply = supplies[i];
                var transactions = await Transaction.find({"$and": [{"type": "SUPPLY"}, {"reference.supply": supply}]});
                for(let j=0; j<transactions.length; j++) {
                    var transaction = transactions[j];
                    var done = false;
                    var item = await Stationery.findById(transaction.item).select("name");
                    for (let k in ans) {
                        if(k===item.name) {
                            ans[k] = {
                                quantity: ans[k].quantity+transaction.quantity,
                                transactions: [
                                    ...ans[k].transactions,
                                    {
                                        "quantity": transaction.quantity,
                                        "remarks": transaction.remarks,
                                        "date": supply.date
                                    }
                                ]
                            }
                            // console.log(ans);
                            done=true;
                        }
                    }
                    if(done===false) {
                        // console.log("adding");
                        ans[item.name] = {
                            quantity: transaction.quantity,
                            transactions: [
                                {
                                    "quantity": transaction.quantity,
                                    "remarks": transaction.remarks,
                                    "date": supply.date
                                }
                            ]
                        }
                        // console.log(ans);
                    }
                    // done=false;
                }
            }

            res.status(200).json({...supplier._doc, supplies: ans});
        } catch (err) {
            console.log(err);
            res.status(400).json({"msg": err.message});
        }
    }
});

router.get("/stationery/:name&:type", async(req, res) => {
    // particular employee with all transactions of his, listed (with demand) wrt date
    const {name, type} = req.params;

    var item = await searchStationery({name});
    if(!item) {
        console.log("Stationery with that name does not exist");
        return res
            .status(400)
            .json({ error: 'Stationery with that name does not exist' });
    }
    
    if(type=="DATE_WISE") {
        try {
            var transactions = await Transaction.find({item: item});
            for(var i=0; i<transactions.length; i++) {
                if(transactions[i].type==="DEMAND") {
                    var demand = await Demand.findById(transactions[i].reference.demand).populate("employee");
                    transactions[i] = {...transactions[i]._doc, demands: demand};
                }
                else if(transactions.type==="SUPPLY") {
                    var supply = await Supply.findById(transactions[i].reference.supply).populate("supplier");//.select({updatedAt: 0, createdAt: 0, employee: 0, __v: 0});
                    transactions[i] = {...transactions[i]._doc, supply: supply};
                }
            }
    
            res.status(200).json({...item._doc, transactions: transactions});
        } catch (err) {
            res.status(400).json({"msg": err.message});
        }
    }
    else if(type=="PERSON_WISE") {
        try{
            var dt = {};
            var st = {};

            var dtransactions = await Transaction.find({"$and": [{"type": "DEMAND"}, {item: item}]});
            for(let i=0; i<dtransactions.length; i++) {
                var transaction = dtransactions[i];
                var demand = await Demand.findById(transaction.reference.demand);

                    var done = false;
                    var employee = await Employee.findById(demand.employee).select("designation");
                    for (let k in dt) {
                        if(k===employee.designation) {
                            dt[k] = {
                                quantity: dt[k].quantity+transaction.quantity,
                                transactions: [
                                    ...dt[k].transactions,
                                    {
                                        "quantity": transaction.quantity,
                                        "remarks": transaction.remarks,
                                        "date": demand.date
                                    }
                                ]
                            }
                            // console.log(dt);
                            done=true;
                        }
                    }
                    if(done===false) {
                        // console.log("adding");
                        dt[employee.designation] = {
                            quantity: transaction.quantity,
                            transactions: [
                                {
                                    "quantity": transaction.quantity,
                                    "remarks": transaction.remarks,
                                    "date": demand.date
                                }
                            ]
                        }
                        // console.log(ans);
                    
                    // done=false;
                }
            }

            var stransactions = await Transaction.find({"$and": [{"type": "SUPPLY"}, {item: item}]});
            for(let i=0; i<stransactions.length; i++) {
                var transaction = stransactions[i];
                var supply = await Supply.findById(transaction.reference.supply);

                    var done = false;
                    var supplier = await Supplier.findById(supply.supplier).select("organization");
                    if(supplier) {    
                        for (let k in st) {
                            if(k===supplier.organization) {
                                st[k] = {
                                    quantity: st[k].quantity+transaction.quantity,
                                    transactions: [
                                        ...st[k].transactions,
                                        {
                                            "quantity": transaction.quantity,
                                            "remarks": transaction.remarks,
                                            "date": supply.date
                                        }
                                    ]
                                }
                                // console.log(st);
                                done=true;
                            }
                        }
                        if(done===false) {
                            // console.log("adding");
                            st[supplier.organization] = {
                                quantity: transaction.quantity,
                                transactions: [
                                    {
                                        "quantity": transaction.quantity,
                                        "remarks": transaction.remarks,
                                        "date": supply.date
                                    }
                                ]
                            }
                        }
                        // console.log(ans);
                    
                    // done=false;
                }
            }

            res.status(200).json({...item._doc, demands: dt, supplies: st});
        } catch (err) {
            console.log(err);
            res.status(400).json({"msg": err.message});
        }
    }
});

router.get("/stationery", async(req, res) => {
    // get list of all stationery each of it having their total no.of transactions (seperate demand and supply) (today, this week, this month, all time)
    try{
        var stationery = await Stationery.find();
        // console.log(stationery);
        for(var i=0; i<stationery.length; i++) {
            var transactions = await Transaction.find({item: stationery[i]}).populate("reference.demand reference.supply", "date");
            // console.log(transactions);
            var supply = [0, 0, 0], demand = [0, 0, 0], curr= new Date();
            transactions.map(transaction => {
                // console.log(transaction);
                if (transaction.reference.demand !== null){
                    demand[0] += transaction.reference.demand.date && transaction.reference.demand.date.getDate()===curr.getDate()? transaction.quantity: 0;
                    demand[1] += transaction.reference.demand.date && transaction.reference.demand.date.getMonth()===curr.getMonth()? transaction.quantity: 0;
                    demand[2] += transaction.quantity;
                }
                else if (transaction.reference.supply !== null) {
                    supply[0] += transaction.reference.supply.date && transaction.reference.supply.date.getDate()===curr.getDate()? transaction.quantity: 0;
                    supply[1] += transaction.reference.supply.date && transaction.reference.supply.date.getMonth()===curr.getMonth()? transaction.quantity: 0;
                    supply[2] += transaction.quantity;
                }
            });
            stationery[i] = {...stationery[i]._doc, demand: demand, supply: supply};
        }
        res.status(200).json(stationery);
    } catch (err) {
        res.status(400).json({"msg": err.message});
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
        var transaction = type=="DEMAND"? await Demand.findById(transactionId).populate("employee"): await Supply.findById(transactionId).populate("supplier");
        // console.log(transaction);

        var transactions = await Transaction.find({"$and": [{"$or": [{"reference.demand": transaction}, {"reference.supply": transaction}]}, {"type": type}]}).populate("item");
        

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
        var supply = await Supply.find().populate("supplier");
        // console.log(transaction);

        // var transactions = await Transaction.find({"$and": [{"$or": [{"reference.demand": transaction._id}, {"reference.supply": transaction._id}]}, {"type": type}]});
        res.status(200).json({supply: supply, demand: demand});
    } catch (err) {
        res.status(400).json({"msg": err});
    }
});


module.exports = router;
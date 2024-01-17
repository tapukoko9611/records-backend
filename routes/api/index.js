const router = require("express").Router();

const employeeRoutes = require("./employee");
const stationeryRoutes = require("./stationery");
const transactionRoutes = require("./transaction");
const queryRoutes = require("./query");
const searchRoutes = require("./search"); 

router.use("/employee", employeeRoutes);
router.use("/stationery", stationeryRoutes);
router.use("/transaction", transactionRoutes);
router.use("/query", queryRoutes);
router.use("/search", searchRoutes);

module.exports = router;
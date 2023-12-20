const router = require("express").Router();
const apiRoutes = require("./api");

const keys = require("../config/keys");
const { apiURL } = keys.app;

const api = `/${apiURL}`;

router.use(api, apiRoutes);
router.use(api, (req, res) => res.status(404).json("No api route found"));

module.exports = router;
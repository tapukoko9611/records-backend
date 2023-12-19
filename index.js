const express = require("express");
require("dotenv").config();

const app = express();

app.listen(process.env.PORT || 5000, () => {
    console.log("Listening");
});
require("dotenv").config();
const mongoose = require("mongoose");
const chalk = require("chalk");

const keys = require("../config/keys");
const { database } = keys;

const setupDB = async () => {
    try {
        // mongoose.set("useCreateIndex", true);
        mongoose
            .connect(database.url, {
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                // useFindAndModify: false
            })
            .then(() =>
                console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`)
            )
            .catch(err => console.log(`${chalk.red(err)}`));
    } catch (error) {
        console.log(error);
    }
};

module.exports = setupDB;
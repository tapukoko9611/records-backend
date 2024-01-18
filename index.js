require("dotenv").config();
const express = require("express");
const chalk = require("chalk");
const cors = require('cors');
const helmet = require('helmet');


const keys = require("./config/keys");
const routes = require("./routes");
const setupDB = require("./utils/db");

const { port } = keys;
const app = express();
const http = require('http').Server(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    helmet({
        contentSecurityPolicy: false,
        frameguard: true
    })
);
app.use(cors());
app.set("trust proxy", true);

setupDB();
app.use(routes);

// app.listen(port, () => {
//     console.log(
//         `${chalk.green('✓')} ${chalk.blue(
//             `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
//         )}`
//     );
// });

http.listen(port, async() => {
    console.log(`${chalk.green('✓')} ${chalk.blue(
                    `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
                )}`);
})
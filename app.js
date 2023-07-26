const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use('/api/issues', express.json());

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;

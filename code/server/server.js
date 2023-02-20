"use strict";
const express = require("express");
const morgan = require("morgan");

// init express
const app = new express();
app.use(morgan("dev"));
app.use(express.json());

const port = 3001;

// Require Database Helper to inizialize DB
const DatabaseHelper = require("./database/DatabaseHelper");
new DatabaseHelper();

// Require APIs
const APIposition = require("./api/position/APIposition");
const APIsku = require("./api/sku/APIsku");
const APIInternalOrder = require("./api/order/APIInternalOrder");
const APIRestockOrder = require("./api/order/APIRestockOrder");
const APItestDescriptor = require("./api/testDescriptor/APItestDescriptor");
const APItestResult = require("./api/testResult/APItestResult");
const APIsku_item = require("./api/sku_item/APIsku_item");
const APIuser = require("./api/user/user_api");
const APIitem = require("./api/item/APIitem");
const APIReturnOrder = require("./api/order/return_order_api");

// Initialize API
APIposition(app);
APIsku(app);
APIsku_item(app);
APIInternalOrder(app);
APIRestockOrder(app);
APIReturnOrder(app);
APItestDescriptor(app);
APItestResult(app);
APIitem(app);
APIuser(app);


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
